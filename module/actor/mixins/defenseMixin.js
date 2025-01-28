import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';
import { RollConfig } from '../../scripts/rollConfig.js';
import { applyStatusEffectToActor } from '../../scripts/statusEffects/applyStatusEffect.js';
import { applyActiveEffectToActorViaId } from '../../scripts/activeEffects/applyActiveEffect.js';
import { getRandomInt } from '../../scripts/helper.js';
import ChatMessageData from '../../chatMessage/chatMessageData.js';

const DialogV2 = foundry.applications.api.DialogV2;

export let defenseMixin = {
    async prepareAndExecuteDefense(defenseOptions, attackDamageObject, totalAttack, attacker) {
        const content = `
        <div class="flex">
            <label>${game.i18n.localize('WITCHER.Dialog.DefenseExtra')}: <input type="checkbox" name="isExtraDefense"></label> <br />
        </div>
        <label>${game.i18n.localize('WITCHER.Dialog.attackCustom')}: <input type="Number" class="small" name="customDef" value=0></label> <br />`;

        let buttons = Array.from(
            defenseOptions.map(option => {
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
                this.getList(itemType)
                    .filter(item => !item.system.isAmmo)
                    .forEach(item =>
                        chooser.push({
                            value: item.system.meleeAttackSkill ?? 'melee',
                            label: item.name,
                            itemId: item.id
                        })
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

        return this.skillDefense(
            {
                skillName,
                modifier: selectedDefense.modifier,
                stagger: selectedDefense.stagger,
                block: selectedDefense.block
            },
            {
                totalAttack,
                attackDamageObject,
                attacker
            },
            { extraDefense, customDef },
            defenseAction,
            itemId
        );
    },

    async skillDefense(
        { skillName, modifier = 0, stagger = false, block = false },
        { totalAttack, attackDamageObject, attacker },
        { extraDefense = false, customDef = 0 },
        defenseAction,
        defenseItemId
    ) {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        if (!this.handleExtraDefense(extraDefense)) {
            return;
        }
        let skillMapEntry = CONFIG.WITCHER.skillMap[skillName];

        let stat = this.system.stats[skillMapEntry.attribute.name].current;
        let skill = this.system.skills[skillMapEntry.attribute.name][skillName];
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
                : `${modifier}[${game.i18n.localize('WITCHER.Defense.defenseOptions.' + defenseAction)}]`;

            if (defenseAction == 'parry' || defenseAction == 'parryThrown') {
                let weapon = this.items.get(defenseItemId);
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
                : `+${modifier}[${game.i18n.localize('WITCHER.Defense.defenseOptions.' + defenseAction)}]`;
        }

        if (customDef != '0') {
            rollFormula += !displayRollDetails
                ? `+${customDef}`
                : ` +${customDef}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
        }

        rollFormula = this.handleSpecialModifier(rollFormula, defenseAction, this.items.get(defenseItemId)?.type);
        rollFormula += this.addAllModifiers(skillName);

        if (skillName != 'resistmagic' && this.statuses.find(status => status == 'stun')) {
            rollFormula = '10[Stun]';
        }

        let messageData = new ChatMessageData(this);
        messageData.flavor = `<h1>${game.i18n.localize('WITCHER.Defense.name')}: ${game.i18n.localize('WITCHER.Defense.defenseOptions.' + defenseAction)}</h1><p>${displayFormula}</p>`;

        let roll = await extendedRoll(
            rollFormula,
            messageData,
            this.createDefenseRollConfig(CONFIG.WITCHER.skillMap[skillName], totalAttack)
        );
        let crit = this.checkForCrit(roll.total, totalAttack);
        if (crit) {
            messageData.flavor += `<h3 class='center-important crit-taken'>${game.i18n.localize('WITCHER.Defense.Crit')}: ${game.i18n.localize(CONFIG.WITCHER.CritGravity[crit.severity])}</h3>`;
            crit.location = await this.handleCritLocation(attackDamageObject);
            attackDamageObject.location = crit.location;
            crit.critEffectModifier = attackDamageObject.crit.critEffectModifier;
        }

        let message = await roll.toMessage(messageData);
        message.setFlag('TheWitcherTRPG', 'crit', crit);

        this.handleDefenseResults(roll, { totalAttack, attackDamageObject, attacker }, defenseItemId, {
            stagger,
            block
        });
    },

    handleExtraDefense(extraDefense) {
        if (extraDefense) {
            let newSta = this.system.derivedStats.sta.value - 1;
            if (newSta < 0) {
                ui.notifications.error(game.i18n.localize('WITCHER.Spell.notEnoughSta'));
                return false;
            }
            this.update({
                'system.derivedStats.sta.value': newSta
            });
        }

        return true;
    },

    handleSpecialModifier(formula, action, additionalTag) {
        let relevantModifier = this.getList('globalModifier')
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
                    this.system.lifepathModifiers.shieldParryBonus > 0
                        ? ` +${this.system.lifepathModifiers.shieldParryBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                        : '';
            }

            if (action === 'parrythrown') {
                formula +=
                    this.system.lifepathModifiers.shieldParryThrownBonus > 0
                        ? ` +${this.system.lifepathModifiers.shieldParryThrownBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                        : '';
            }
        }

        return formula;
    },

    createDefenseRollConfig(skill, totalAttack) {
        let config = new RollConfig();
        config.showResult = false;
        config.defense = true;
        config.threshold = totalAttack;
        config.thresholdDesc = skill.label;
        config.flagsOnSuccess = this.getDefenseSuccessFlags(skill);
        config.flagsOnFailure = this.getDefenseFailFlags(skill);

        return config;
    },

    checkForCrit(defenseRoll, totalAttack) {
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
    },

    async handleCritLocation(attackDamageObject) {
        if (attackDamageObject.originalLocation.includes('random')) {
            let critLocation = (await new Roll('2d6+' + attackDamageObject.crit.critLocationModifier).evaluate()).total;
            let location;
            switch (true) {
                case critLocation >= 12: {
                    location = this.getLocationObject('head');
                    location.critEffect = 6;
                    break;
                }
                case critLocation == 11: {
                    location = this.getLocationObject('head');
                    location.critEffect = 1;
                    break;
                }
                case critLocation == 9 || critLocation == 10: {
                    location = this.getLocationObject('torso');
                    location.critEffect = 6;
                    break;
                }
                case critLocation >= 6 && critLocation <= 8: {
                    location = this.getLocationObject('torso');
                    location.critEffect = 1;
                    break;
                }
                case critLocation == 4 || critLocation == 5: {
                    let side = getRandomInt(2);
                    location = this.getLocationObject((side == 1 ? 'left' : 'right') + 'Arm');
                    break;
                }
                case critLocation < 4: {
                    let side = getRandomInt(2);
                    location = this.getLocationObject((side == 1 ? 'left' : 'right') + 'Leg');
                    break;
                }
            }
            return location;
        } else {
            return attackDamageObject.location;
        }
    },

    handleDefenseResults(roll, { totalAttack, attackDamageObject, attacker }, defenseItemId, { stagger, block }) {
        if (roll.total < totalAttack) {
            applyActiveEffectToActorViaId(
                this.uuid,
                attackDamageObject.itemUuid,
                'applyOnHit',
                attackDamageObject.duration
            );

            this.applyStatus(['stun']);
        } else {
            if (stagger) {
                applyStatusEffectToActor(attacker, 'staggered', 1);
            }

            if (block) {
                let item = this.items.get(defenseItemId);
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
        }
    }
};
