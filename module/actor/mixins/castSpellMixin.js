import ChatMessageData from '../../chatMessage/chatMessageData.js';
import { applyActiveEffectToActor, applyActiveEffectToTargets } from '../../scripts/activeEffects/applyActiveEffect.js';
import { applyModifierToActor, applyModifierToTargets } from '../../scripts/globalModifier/applyGlobalModifier.js';
import { RollConfig } from '../../scripts/rollConfig.js';
import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';
import { applyStatusEffectToActor, applyStatusEffectToTargets } from '../../scripts/statusEffects/applyStatusEffect.js';

const DialogV2 = foundry.applications.api.DialogV2;

export let castSpellMixin = {
    async castSpell(spellItem) {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let damage = spellItem.createBaseDamageObject();

        let templateInfo = {
            actor: this
        };

        let rollFormula = '1d10+';
        if (game.settings.get('TheWitcherTRPG', 'woundsAffectSkillBase')) {
            rollFormula += '(';
        }
        rollFormula += !displayRollDetails
            ? `${this.system.stats.will.current}`
            : `${this.system.stats.will.current}[${game.i18n.localize(CONFIG.WITCHER.statMap.will.label)}]`;

        let usedSkill =
            CONFIG.WITCHER.skillMap[spellItem.system.spellAttackSkill] ??
            CONFIG.WITCHER.magic[spellItem.type]?.skill ??
            CONFIG.WITCHER.magic[spellItem.system.class].skill;

        rollFormula +=
            `+${this.system.skills.will[usedSkill.name].value}` +
            (displayRollDetails ? `[${game.i18n.localize(usedSkill.label)}]` : '');
        rollFormula += this.addAllModifiers(usedSkill.name);

        let armorEnc = this.getArmorEcumbrance();
        if (armorEnc > 0) {
            rollFormula += !displayRollDetails
                ? ` -${armorEnc}${
                      this.system.lifepathModifiers.ignoredEvWhenCasting > 0
                          ? ` +${this.system.lifepathModifiers.ignoredEvWhenCasting}`
                          : ''
                  }`
                : ` -${armorEnc}[${game.i18n.localize('WITCHER.Armor.EncumbranceValue')}]${
                      this.system.lifepathModifiers.ignoredEvWhenCasting > 0
                          ? ` +${this.system.lifepathModifiers.ignoredEvWhenCasting}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                          : ''
                  }`;
            rollFormula = this.handleSpecialModifier(rollFormula, 'magic-armorencumbarance');
        }
        rollFormula = this.handleSpecialModifier(rollFormula, 'magic');

        let useFocus = false;
        let handlebarFocusOptions = {};
        if (this.system.focus1.value > 0) {
            useFocus = true;
            handlebarFocusOptions.focus1 = {
                value: this.system.focus1.value,
                label: this.system.focus1.name + '(' + this.system.focus1.value + ')'
            };
        }
        if (this.system.focus2.value > 0) {
            useFocus = true;
            handlebarFocusOptions.focus2 = {
                value: this.system.focus2.value,
                label: this.system.focus2.name + '(' + this.system.focus2.value + ')'
            };
        }
        if (this.system.focus3.value > 0) {
            useFocus = true;
            handlebarFocusOptions.focus3 = {
                value: this.system.focus3.value,
                label: this.system.focus3.name + '(' + this.system.focus3.value + ')'
            };
        }
        if (this.system.focus4.value > 0) {
            useFocus = true;
            handlebarFocusOptions.focus4 = {
                value: this.system.focus4.value,
                label: this.system.focus4.name + '(' + this.system.focus4.value + ')'
            };
        }

        let data = {
            causeDamage: spellItem.system.causeDamages,
            staminaIsVar: spellItem.system.staminaIsVar,
            useFocus: useFocus,
            focusOptions: handlebarFocusOptions
        };

        const dialogTemplate = await renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/combat/spell-attack.hbs',
            data
        );

        let { staCostTotal, customModifier, isExtraAttack, focusValue, secondFocusValue, location } =
            await DialogV2.prompt({
                window: { title: `${game.i18n.localize('WITCHER.Spell.MagicCost')}` },
                content: dialogTemplate,
                modal: true,
                ok: {
                    callback: (event, button, dialog) => {
                        return {
                            staCostTotal: button.form.elements.staCost?.value ?? spellItem.system.stamina,
                            customModifier: button.form.elements.customMod.value,
                            isExtraAttack: button.form.elements.isExtraAttack.checked,
                            focusValue: button.form.elements.focus?.value ?? 0,
                            secondFocusValue: button.form.elements.secondFocus?.value ?? 0,
                            location: button.form.elements.location?.value
                        };
                    }
                }
            });

        let origStaCost = staCostTotal;

        staCostTotal -= Number(focusValue) + Number(secondFocusValue);
        if (isExtraAttack) {
            staCostTotal += 3;
        }

        let useMinimalStaCost = false;
        if (staCostTotal < 1) {
            useMinimalStaCost = true;
            staCostTotal = 1;
        }

        let newSta = this.system.derivedStats.sta.value - staCostTotal;
        if (newSta < 0) {
            return ui.notifications.error(game.i18n.localize('WITCHER.Spell.notEnoughSta'));
        }

        this.update({
            'system.derivedStats.sta.value': newSta
        });

        let staCostDisplay = `${origStaCost}[${game.i18n.localize('WITCHER.Spell.Short.StaCost')}]`;

        if (isExtraAttack) {
            staCostDisplay += ` + 3[${game.i18n.localize('WITCHER.Dialog.attackExtra')}]`;
        }

        staCostDisplay += ` -${Number(focusValue) + Number(secondFocusValue)}[${game.i18n.localize('WITCHER.Actor.DerStat.Focus')}]`;
        staCostDisplay += ` =  ${staCostTotal}`;
        if (useMinimalStaCost) {
            staCostDisplay += `[${game.i18n.localize('WITCHER.MinValue')}]`;
        }
        templateInfo.staCostDisplay = staCostDisplay;

        if (customModifier < 0) {
            rollFormula += !displayRollDetails
                ? ` ${customModifier}`
                : ` ${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
        }
        if (customModifier > 0) {
            rollFormula += !displayRollDetails
                ? ` +${customModifier}`
                : ` +${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
        }
        if (isExtraAttack) {
            rollFormula += !displayRollDetails ? ` -3` : ` -3[${game.i18n.localize('WITCHER.Dialog.attackExtra')}]`;
        }

        switch (spellItem.system.source) {
            case 'mixedElements':
                templateInfo.spellSource = 'WITCHER.Spell.Mixed';
                break;
            case 'earth':
                templateInfo.spellSource = 'WITCHER.Spell.Earth';
                break;
            case 'air':
                templateInfo.spellSource = 'WITCHER.Spell.Air';
                break;
            case 'fire':
                templateInfo.spellSource = 'WITCHER.Spell.Fire';
                break;
            case 'Water':
                templateInfo.spellSource = 'WITCHER.Spell.Water';
                break;
        }

        if (spellItem.system.duration) {
            let durationText = spellItem.system.duration;
            damage.duration = durationText.replace(/\D/g, '');
            if (spellItem.system.duration.match(/\d+d\d+/g)) {
                let durationSubstrings = spellItem.system.duration.split(' ');
                let roll = await new Roll(durationSubstrings.shift()).evaluate();
                damage.duration = roll.total;

                let durationRoll = roll.toAnchor();
                durationText = durationRoll.outerHTML + ' ' + durationSubstrings.join(' ');
            }

            templateInfo.durationText = durationText;
        }

        if (spellItem.system.causeDamages) {
            let dmg = spellItem.system.damage || '0';
            if (spellItem.system.staminaIsVar) {
                dmg = this.calcStaminaMulti(origStaCost, dmg);

                spellItem.system.damageProperties?.effects?.forEach(effect => {
                    if (effect.varEffect) {
                        effect.percentage = this.calcStaminaMulti(origStaCost, effect.percentage);
                    }
                });
            }

            damage.formula = dmg;
            let touchedLocation = this.getLocationObject(location);
            rollFormula += !displayRollDetails
                ? `${touchedLocation.modifier}`
                : `${touchedLocation.modifier}[${touchedLocation.alias}]`;
            damage.location = touchedLocation;
            damage.originalLocation = location;
            damage.type = spellItem.system.damageType;
        }

        if (spellItem.system.createsShield) {
            damage.shield = spellItem.system.shield || '0';
            if (spellItem.system.staminaIsVar) {
                damage.shield = this.calcStaminaMulti(origStaCost, damage.shield);
            }
        }

        if (spellItem.system.doesHeal) {
            damage.heal = spellItem.system.heal || '0';
            if (spellItem.system.staminaIsVar) {
                damage.heal = this.calcStaminaMulti(origStaCost, heal);
            }
        }

        if (spellItem.system.selfEffects?.length > 0) {
            templateInfo.selfEffects = [];
            spellItem.system.selfEffects.forEach(effect => {
                if (effect.name != '') {
                }
                if (effect.statusEffect) {
                    let statusEffect = CONFIG.WITCHER.statusEffects.find(status => status.id == effect.statusEffect);
                    templateInfo.selfEffects.push({ effect: effect, statusEffect: statusEffect });
                }
            });
        }

        const chatMessage = await renderTemplate('systems/TheWitcherTRPG/templates/chat/combat/spellItem.hbs', {
            spellItem,
            templateInfo,
            damage
        });
        let messageData = new ChatMessageData(
            this,
            chatMessage,
            'attack',
            {
                attacker: this.uuid,
                attack: spellItem.getSpellFlags(),
                damage: damage,
                defenseOptions: spellItem.system.defenseOptions
            },
            {
                TheWitcherTRPG: {
                    attack: spellItem.getSpellFlags(),
                    damage: damage
                }
            }
        );

        let config = new RollConfig({ showResult: false });

        let roll = await extendedRoll(rollFormula, messageData, config);
        await roll.toMessage(messageData);

        spellItem.createSpellVisuals(roll, damage);

        if (!roll.options.fumble) {
            spellItem.system.globalModifiers?.forEach(modifier => applyModifierToActor(this.uuid, modifier));
            spellItem.system.selfEffects?.forEach(effect =>
                applyStatusEffectToActor(this.uuid, effect.statusEffect, damage.duration)
            );
            applyActiveEffectToActor(
                this.uuid,
                spellItem.effects.filter(effect => effect.system.applySelf),
                damage.duration
            );

            applyStatusEffectToTargets(spellItem.system.onCastEffects, damage.duration);
            applyModifierToTargets(spellItem.system.damageProperties?.hitGlobalModifiers);
            applyActiveEffectToTargets(
                spellItem.effects.filter(effect => effect.system.applyOnTarget),
                damage.duration
            );
        }

        return roll;
    },

    calcStaminaMulti(origStaCost, value) {
        let staminaMulti = parseInt(origStaCost);

        if (value.replace) {
            value = value.replace('/STA', '');
        }

        if (value.includes && value.includes('d')) {
            let diceAmount = value.split('d')[0];
            let diceType = 'd' + value.split('d')[1].replace('/STA', '');
            return staminaMulti * diceAmount + diceType;
        } else {
            return staminaMulti * value;
        }
    }
};
