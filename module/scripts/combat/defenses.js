import { extendedRoll } from '../rolls/extendedRoll.js';
import { RollConfig } from '../rollConfig.js';
import { getInteractActor, getRandomInt } from '../helper.js';
import { applyModifierToActor } from '../globalModifier/applyGlobalModifier.js';
import { applyStatusEffectToActor } from '../statusEffects/applyStatusEffect.js';
import { applyActiveEffectToActorViaId } from '../activeEffects/applyActiveEffect.js';

const DialogV2 = foundry.applications.api.DialogV2;

export function addDefenseOptionsContextMenu(html, options) {
    let canDefend = li => {
        return game.messages.get(li[0].dataset.messageId).system.defenseOptions;
    };
    options.push({
        name: `${game.i18n.localize('WITCHER.Context.Defense')}`,
        icon: '<i class="fas fa-shield-alt"></i>',
        condition: canDefend,
        callback: async li => {
            executeDefense(await getInteractActor(), li[0].dataset.messageId);
        }
    });
    return options;
}

async function executeDefense(actor, messageId) {
    if (!actor) return;

    let message = game.messages.get(messageId);
    let attackDamageObject = message?.getFlag('TheWitcherTRPG', 'damage');

    const content = `
    <div class="flex">
        <label>${game.i18n.localize('WITCHER.Dialog.DefenseExtra')}: <input type="checkbox" name="isExtraDefense"></label> <br />
    </div>
    <label>${game.i18n.localize('WITCHER.Dialog.attackCustom')}: <input type="Number" class="small" name="customDef" value=0></label> <br />`;

    let buttons = Array.from(
        message?.system.defenseOptions.map(option => {
            return {
                label: CONFIG.WITCHER.defenseOptions.find(defense => defense.value === option).label,
                action: option,
                callback: (event, button, dialog) => {
                    return {
                        defenseAction: option,
                        extraDefense: button.form.elements.isExtraDefense.checked,
                        customDef: button.form.elements.customDef.value
                    };
                }
            };
        })
    );

    let { defenseAction, extraDefense, customDef } = await DialogV2.wait({
        window: { title: `${game.i18n.localize('WITCHER.Dialog.DefenseTitle')}` },
        content,
        buttons: buttons
    });

    let selectedDefense = CONFIG.WITCHER.defenseOptions.find(defense => defense.value === defenseAction);

    let chooser = [];
    if (selectedDefense.skills) {
        selectedDefense.skills.forEach(skill =>
            chooser.push({ value: skill, label: CONFIG.WITCHER.skillMap[skill].label })
        );
    }

    if (selectedDefense.itemTypes) {
        selectedDefense.itemTypes.forEach(itemType =>
            actor
                .getList(itemType)
                .forEach(item =>
                    chooser.push({ value: item.system.attackSkill ?? 'melee', label: item.name, itemId: item.id })
                )
        );
    }

    let skillName;
    let itemId;

    if (chooser.length == 1) {
        skillName = chooser[0].value;
        itemId = chooser[0].itemId;
    } else {
        let options = '';
        chooser.forEach(
            option =>
                (options += `<option value="${option.value}" data-itemId="${option.itemId}"> ${game.i18n.localize(option.label)}</option>`)
        );

        let chooserContent = `<label>${game.i18n.localize('WITCHER.Dialog.DefenseWith')}: </label><select name="choosenDefense">${options}</select><br />`;
        ({ skillName, itemId } = await DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.Dialog.DefenseWith')}` },
            content: chooserContent,
            ok: {
                callback: (event, button, dialog) => {
                    return {
                        skillName: button.form.elements.choosenDefense.value,
                        itemId: button.form.elements.choosenDefense.selectedOptions[0].dataset.itemid
                    };
                }
            }
        }));
    }

    return defense(
        actor,
        {
            skillName,
            modifier: selectedDefense.modifier,
            stagger: selectedDefense.stagger,
            block: selectedDefense.block
        },
        {
            totalAttack: message.system.attackRoll,
            attackDamageObject,
            attacker: message.system.attacker
        },
        { extraDefense, customDef },
        defenseAction,
        itemId
    );
}

async function defense(
    actor,
    { skillName, modifier = 0, stagger = false, block = false },
    { totalAttack, attackDamageObject, attacker },
    { extraDefense = false, customDef = 0 },
    defenseAction,
    defenseItemId
) {
    let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

    if (!handleExtraDefense(extraDefense, actor)) {
        return;
    }
    let skillMapEntry = CONFIG.WITCHER.skillMap[skillName];

    let stat = actor.system.stats[skillMapEntry.attribute.name].current;
    let skill = actor.system.skills[skillMapEntry.attribute.name][skillName];
    let skillValue = skill.value;

    let displayFormula = `1d10 + ${game.i18n.localize(skillMapEntry.attribute.labelShort)} + ${game.i18n.localize(skillMapEntry.label)}`;

    let rollFormula = '1d10+';
    if (game.settings.get('TheWitcherTRPG', 'woundsAffectSkillBase')) {
        rollFormula += '(';
    }
    rollFormula += !displayRollDetails
        ? `${stat}+${skillValue}`
        : `${stat}[${game.i18n.localize(skillMapEntry.attribute.labelShort)}] +${skillValue}[${game.i18n.localize(skillMapEntry.label)}]`;

    if (modifier < 0) {
        rollFormula += !displayRollDetails
            ? `${modifier}`
            : `${modifier}[${game.i18n.localize('WITCHER.Dialog.DefenseOptions.' + defenseAction)}]`;

        if (defenseAction == 'parry' || defenseAction == 'parryThrown') {
            let weapon = actor.items.get(defenseItemId);
            if (weapon?.system.defenseProperties?.parrying) {
                rollFormula += !displayRollDetails
                    ? `+${Math.abs(modifier)}`
                    : `+${Math.abs(modifier)}[${weapon.name}]`;
            }
        }
    }
    if (modifier > 0) {
        rollFormula += !displayRollDetails
            ? `+${modifier}`
            : `+${modifier}[${game.i18n.localize('WITCHER.Dialog.DefenseOptions.' + defenseAction)}]`;
    }

    if (customDef != '0') {
        rollFormula += !displayRollDetails
            ? `+${customDef}`
            : ` +${customDef}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
    }

    rollFormula = handleSpecialModifier(actor, rollFormula, defenseAction, actor.items.get(defenseItemId)?.type);
    rollFormula += actor.addAllModifiers(skillName);

    if (skillName != 'resistmagic' && actor.statuses.find(status => status == 'stun')) {
        rollFormula = '10[Stun]';
    }

    let messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `<h1>${game.i18n.localize('WITCHER.Dialog.Defense')}</h1>`
    };
    messageData.flavor = `<h1>${game.i18n.localize('WITCHER.Dialog.Defense')}: ${game.i18n.localize('WITCHER.Dialog.DefenseOptions.' + defenseAction)}</h1><p>${displayFormula}</p>`;

    let roll = await extendedRoll(
        rollFormula,
        messageData,
        createRollConfig(actor, CONFIG.WITCHER.skillMap[skillName], totalAttack)
    );
    let crit = checkForCrit(roll.total, totalAttack);
    if (crit) {
        messageData.flavor += `<h3 class='center-important crit-taken'>${game.i18n.localize('WITCHER.Defense.Crit')}: ${game.i18n.localize(CONFIG.WITCHER.CritGravity[crit.severity])}</h3>`;
        crit.location = await handleCritLocation(actor, attackDamageObject);
        attackDamageObject.location = crit.location;
        crit.critEffectModifier = attackDamageObject.crit.critEffectModifier;
    }

    let message = await roll.toMessage(messageData);
    message.setFlag('TheWitcherTRPG', 'crit', crit);

    handleDefenseResults(actor, roll, { totalAttack, attackDamageObject, attacker }, defenseItemId, {
        stagger,
        block
    });
}

function handleSpecialModifier(actor, formula, action, additionalTag) {
    let relevantModifier = actor
        .getList('globalModifier')
        .filter(modifier => modifier.system.isActive)
        .filter(modifier => modifier.system.special?.length > 0)
        .map(modifier => modifier.system.special)
        .flat()
        .map(modifier => CONFIG.WITCHER.specialModifier.find(special => special.id == modifier.special))
        .filter(special => special?.tags?.includes(action))
        .filter(special => special?.additionalTags?.includes(additionalTag?.toLowerCase()) ?? true);

    relevantModifier.forEach(modifier => (formula += `${modifier.formula}[${game.i18n.localize(modifier.name)}]`));

    if (additionalTag === 'armor') {
        if (action === 'parry') {
            formula +=
                actor.system.lifepathModifiers.shieldParryBonus > 0
                    ? ` +${actor.system.lifepathModifiers.shieldParryBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                    : '';
        }

        if (action === 'parrythrown') {
            formula +=
                actor.system.lifepathModifiers.shieldParryThrownBonus > 0
                    ? ` +${actor.system.lifepathModifiers.shieldParryThrownBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                    : '';
        }
    }

    return formula;
}

function handleExtraDefense(extraDefense, actor) {
    if (extraDefense) {
        let newSta = actor.system.derivedStats.sta.value - 1;
        if (newSta < 0) {
            ui.notifications.error(game.i18n.localize('WITCHER.Spell.notEnoughSta'));
            return false;
        }
        actor.update({
            'system.derivedStats.sta.value': newSta
        });
    }

    return true;
}

function createRollConfig(actor, skill, totalAttack) {
    let config = new RollConfig();
    config.showResult = false;
    config.defense = true;
    config.threshold = totalAttack;
    config.thresholdDesc = skill.label;
    config.flagsOnSuccess = actor.getDefenseSuccessFlags(skill);
    config.flagsOnFailure = actor.getDefenseFailFlags(skill);

    return config;
}

function checkForCrit(defenseRoll, totalAttack) {
    // 7 - Simple - +3 dmg
    // 10 - Complex - +5 dmg
    // 13 - Difficult - +8 dmg
    // 15 - Deadly - +10 dmg
    let simple = totalAttack - 7;
    let complex = totalAttack - 10;
    let difficult = totalAttack - 13;
    let deadly = totalAttack - 15;

    if (defenseRoll < deadly) {
        return {
            severity: 'deadly',
            critdamage: 10,
            bonusdamage: 20
        };
    }

    if (defenseRoll < difficult) {
        return {
            severity: 'difficult',
            critdamage: 8,
            bonusdamage: 15
        };
    }

    if (defenseRoll < complex) {
        return {
            severity: 'complex',
            critdamage: 5,
            bonusdamage: 10
        };
    }

    if (defenseRoll < simple) {
        return {
            severity: 'simple',
            critdamage: 3,
            bonusdamage: 5
        };
    }

    return null;
}

async function handleCritLocation(actor, attackDamageObject) {
    if (attackDamageObject.originalLocation.includes('random')) {
        let critLocation = (await new Roll('2d6+' + attackDamageObject.crit.critLocationModifier).evaluate()).total;
        let location;
        switch (true) {
            case critLocation >= 12: {
                location = actor.getLocationObject('head');
                location.critEffect = 6;
                break;
            }
            case critLocation == 11: {
                location = actor.getLocationObject('head');
                location.critEffect = 1;
                break;
            }
            case critLocation == 9 || critLocation == 10: {
                location = actor.getLocationObject('torso');
                location.critEffect = 6;
                break;
            }
            case critLocation >= 6 && critLocation <= 8: {
                location = actor.getLocationObject('torso');
                location.critEffect = 1;
                break;
            }
            case critLocation == 4 || critLocation == 5: {
                let side = getRandomInt(2);
                location = actor.getLocationObject((side == 1 ? 'left' : 'right') + 'Arm');
                break;
            }
            case critLocation < 4: {
                let side = getRandomInt(2);
                location = actor.getLocationObject((side == 1 ? 'left' : 'right') + 'Leg');
                break;
            }
        }
        return location;
    } else {
        return attackDamageObject.location;
    }
}

function handleDefenseResults(
    actor,
    roll,
    { totalAttack, attackDamageObject, attacker },
    defenseItemId,
    { stagger, block }
) {
    if (roll.total < totalAttack) {
        if (attackDamageObject.damageProperties.appliesGlobalModifierToHit) {
            attackDamageObject.damageProperties.hitGlobalModifiers.forEach(modifier =>
                applyModifierToActor(actor.uuid, modifier)
            );
        }

        applyActiveEffectToActorViaId(
            actor.uuid,
            attackDamageObject.itemUuid,
            'applyOnHit',
            attackDamageObject.duration
        );
    }

    if (roll.total > totalAttack) {
        if (stagger) {
            applyStatusEffectToActor(attacker, 'staggered', 1);
        }

        if (block) {
            let item = actor.items.get(defenseItemId);
            if (item.type == 'armor') {
                item.update({ 'system.reliability': item.system.reliability - 1 });
                if (item.system.reliability - 1 <= 0) {
                    return ui.notifications.error(game.i18n.localize('WITCHER.Shield.Broken'));
                }
            } else {
                item.update({ 'system.reliable': item.system.reliable - 1 });
                if (item.system.reliable - 1 <= 0) {
                    return ui.notifications.error(game.i18n.localize('WITCHER.Weapon.Broken'));
                }
            }
        }
    } else {
        if (actor.statuses.find(status => status == 'stun')) {
            actor.toggleStatusEffect('stun');
        }
    }
}

export { executeDefense };
