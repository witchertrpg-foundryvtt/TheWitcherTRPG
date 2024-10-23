import { extendedRoll } from '../rolls/extendedRoll.js';
import { RollConfig } from '../rollConfig.js';
import { getInteractActor } from '../helper.js';
import { applyModifierToActor } from '../globalModifier/applyGlobalModifier.js';
import { applyStatusEffectToActor } from '../statusEffects/applyStatusEffect.js';
import { applyActiveEffectToActorViaId } from '../activeEffects/applyActiveEffect.js';

export function addDefenseMessageContextOptions(html, options) {
    let canDefend = li => li.find('.attack-message').length || li.find('.defense').length;
    options.push({
        name: `${game.i18n.localize('WITCHER.Context.Defense')}`,
        icon: '<i class="fas fa-shield-alt"></i>',
        condition: canDefend,
        callback: async li => {
            ExecuteDefense(await getInteractActor(), li[0].dataset.messageId, li.find('.dice-total')[0].innerText);
        }
    });
    return options;
}

function ExecuteDefense(actor, messageId, totalAttack) {
    if (!actor) return;

    let attackDamageObject = game.messages.get(messageId)?.getFlag('TheWitcherTRPG', 'damage');

    let weapons = actor.items.filter(function (item) {
        return (
            item.type == 'weapon' && !item.system.isAmmo && CONFIG.WITCHER.meleeSkills.includes(item.system.attackSkill)
        );
    });
    let shields = actor.items.filter(function (item) {
        return item.type == 'armor' && item.system.location == 'Shield';
    });

    let options = `<option value="brawling"> ${game.i18n.localize('WITCHER.SkRefBrawling')} </option>`;
    weapons.forEach(
        item =>
            (options += `<option value="${item.system.attackSkill}" data-itemId="${item.id}"> ${item.name} (${game.i18n.localize(item.getItemAttackSkill().alias)})</option>`)
    );
    shields.forEach(
        item =>
            (options += `<option value="melee" data-itemId="${item.id}"> ${item.name} (${game.i18n.localize('WITCHER.SkRefMelee')})</option>`)
    );

    const content = `
    <div class="flex">
        <label>${game.i18n.localize('WITCHER.Dialog.DefenseExtra')}: <input type="checkbox" name="isExtraDefense"></label> <br />
    </div>
    <label>${game.i18n.localize('WITCHER.Dialog.DefenseWith')}: </label><select name="form">${options}</select><br />
    <label>${game.i18n.localize('WITCHER.Dialog.attackCustom')}: <input type="Number" class="small" name="customDef" value=0></label> <br />`;

    new Dialog({
        title: `${game.i18n.localize('WITCHER.Dialog.DefenseTitle')}`,
        content,
        buttons: {
            Dodge: {
                label: `${game.i18n.localize('WITCHER.Dialog.ButtonDodge')}`,
                callback: async html => {
                    defense(actor, { skillName: 'dodge' }, { totalAttack, attackDamageObject }, html, 'ButtonDodge');
                }
            },
            Reposition: {
                label: `${game.i18n.localize('WITCHER.Dialog.ButtonReposition')}`,
                callback: async html => {
                    defense(
                        actor,
                        { skillName: 'athletics' },
                        { totalAttack, attackDamageObject },
                        html,
                        'ButtonReposition'
                    );
                }
            },
            Block: {
                label: `${game.i18n.localize('WITCHER.Dialog.ButtonBlock')}`,
                callback: async html => {
                    let defenseSkill = html.find('[name=form]')[0].value;
                    let selectedOption = html.find('[name=form]')[0].selectedOptions[0];
                    defense(
                        actor,
                        { skillName: defenseSkill, block: true },
                        { totalAttack, attackDamageObject },
                        html,
                        'ButtonBlock',
                        selectedOption.dataset.itemid
                    );
                }
            },
            Parry: {
                label: `${game.i18n.localize('WITCHER.Dialog.ButtonParry')}`,
                callback: async html => {
                    let attacker = game.messages.get(messageId)?.getFlag('TheWitcherTRPG', 'attack').owner;
                    let selectedOption = html.find('[name=form]')[0].selectedOptions[0];
                    let defenseSkill = selectedOption.value;
                    defense(
                        actor,
                        { skillName: defenseSkill, modifier: -3, stagger: true },
                        { totalAttack, attackDamageObject, attacker },
                        html,
                        'ButtonParry',
                        selectedOption.dataset.itemid
                    );
                }
            },
            ParryAgainstThrown: {
                label: `${game.i18n.localize('WITCHER.Dialog.ButtonParryThrown')}`,
                callback: async html => {
                    let selectedOption = html.find('[name=form]')[0].selectedOptions[0];
                    let defenseSkill = selectedOption.value;
                    defense(
                        actor,
                        { skillName: defenseSkill, modifier: -5 },
                        { totalAttack, attackDamageObject },
                        html,
                        'ButtonParryThrown',
                        selectedOption.dataset.itemid
                    );
                }
            },
            MagicResist: {
                label: `${game.i18n.localize('WITCHER.Dialog.ButtonMagicResist')}`,
                callback: async html => {
                    defense(
                        actor,
                        { skillName: 'resistmagic' },
                        { totalAttack, attackDamageObject },
                        html,
                        'ButtonMagicResist'
                    );
                }
            }
        }
    }).render(true);
}

async function defense(
    actor,
    { skillName, modifier = 0, stagger = false, block = false },
    { totalAttack, attackDamageObject, attacker },
    html,
    buttonName,
    defenseItemId
) {
    let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

    if (!handleExtraDefense(html, actor)) {
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
            : `${modifier}[${game.i18n.localize('WITCHER.Dialog.' + buttonName)}]`;

        if (buttonName == 'ButtonParry' || buttonName == 'ButtonParryThrown') {
            let weapon = actor.items.get(defenseItemId);
            if (weapon?.system.defenseProperties.parrying) {
                rollFormula += !displayRollDetails
                    ? `+${Math.abs(modifier)}`
                    : `+${Math.abs(modifier)}[${weapon.name}]`;
            }
        }
    }
    if (modifier > 0) {
        rollFormula += !displayRollDetails
            ? `+${modifier}`
            : `+${modifier}[${game.i18n.localize('WITCHER.Dialog.' + buttonName)}]`;
    }

    let customDef = html.find('[name=customDef]')[0].value;
    if (customDef != '0') {
        rollFormula += !displayRollDetails
            ? `+${customDef}`
            : ` +${customDef}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
    }

    rollFormula += actor.addAllModifiers(skillName);
    rollFormula = handleSpecialModifier(
        actor,
        rollFormula,
        buttonName.replace('Button', '').toLowerCase(),
        html.find('[name=form]')[0].selectedOptions[0].getAttribute('type')
    );

    if (skillName != 'resistmagic' && actor.statuses.find(status => status == 'stun')) {
        rollFormula = '10[Stun]';
    }

    let messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: `<h1>${game.i18n.localize('WITCHER.Dialog.Defense')}</h1>`
    };
    messageData.flavor = `<h1>${game.i18n.localize('WITCHER.Dialog.Defense')}: ${game.i18n.localize('WITCHER.Dialog.' + buttonName)}</h1><p>${displayFormula}</p>`;

    let roll = await extendedRoll(
        rollFormula,
        messageData,
        createRollConfig(actor, CONFIG.WITCHER.skillMap[skillName], totalAttack)
    );
    let crit = checkForCrit(roll.total, totalAttack);
    if (crit) {
        messageData.flavor += `<h3 class='center-important crit-taken'>${game.i18n.localize('WITCHER.Defense.Crit')}: ${game.i18n.localize(CONFIG.WITCHER.CritGravity[crit.severity])}</h3>`;
        crit.location = attackDamageObject.location;
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

    return formula;
}

function handleExtraDefense(html, actor) {
    let isExtraDefense = html.find('[name=isExtraDefense]').prop('checked');
    if (isExtraDefense) {
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

export { ExecuteDefense };
