import { RollConfig } from '../../scripts/rollConfig.js';
import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';

export let weaponAttackMixin = {
    async weaponAttack(weapon) {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let displayDmgFormula = `${weapon.system.damage}`;
        let damageFormula = !displayRollDetails
            ? `${weapon.system.damage}`
            : `${weapon.system.damage}[${game.i18n.localize('WITCHER.Diagram.Weapon')}]`;

        let isMeleeAttack = weapon.doesWeaponNeedMeleeSkillToAttack();
        if ((this.type == 'character' || this.system.addMeleeBonus) && isMeleeAttack) {
            if (this.system.attackStats.meleeBonus < 0) {
                displayDmgFormula += `${this.system.attackStats.meleeBonus}`;
                damageFormula += !displayRollDetails
                    ? `${this.system.attackStats.meleeBonus}`
                    : `${this.system.attackStats.meleeBonus}[${game.i18n.localize('WITCHER.Dialog.attackMeleeBonus')}]`;
            }
            if (this.system.attackStats.meleeBonus > 0) {
                displayDmgFormula += `+${this.system.attackStats.meleeBonus}`;
                damageFormula += !displayRollDetails
                    ? `+${this.system.attackStats.meleeBonus}`
                    : `+${this.system.attackStats.meleeBonus}[${game.i18n.localize('WITCHER.Dialog.attackMeleeBonus')}]`;
            }
            damageFormula = this.handleSpecialModifier(damageFormula, 'melee-damage');
        }

        let attackSkill = weapon.getItemAttackSkill();
        let messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this }),
            flavor: `<h1> ${game.i18n.localize('WITCHER.Dialog.attack')}: ${weapon.name}</h1>`
        };

        let ammunitions = ``;
        let noAmmo = 0;
        let ammunitionOption = ``;
        if (weapon.system.usingAmmo) {
            ammunitions = this.items.filter(function (item) {
                return item.type == 'weapon' && item.system.isAmmo;
            });
            let quantity = ammunitions.sum('quantity');
            if (quantity <= 0) {
                noAmmo = 1;
            } else {
                ammunitions.forEach(element => {
                    ammunitionOption += `<option value="${element._id}"> ${element.name}(${element.system.quantity}) </option>`;
                });
            }
        }

        let noThrowable = !this.isEnoughThrowableWeapon(weapon);
        let meleeBonus = this.system.attackStats.meleeBonus;
        let data = {
            item: weapon,
            attackSkill,
            displayDmgFormula,
            isMeleeAttack,
            noAmmo,
            noThrowable,
            ammunitionOption,
            ammunitions,
            meleeBonus: meleeBonus
        };
        const myDialogOptions = { width: 500 };
        const dialogTemplate = await renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/combat/weapon-attack.hbs',
            data
        );

        new Dialog(
            {
                title: `${game.i18n.localize('WITCHER.Dialog.attackWith')}: ${weapon.name}`,
                content: dialogTemplate,
                buttons: {
                    Roll: {
                        label: `${game.i18n.localize('WITCHER.Dialog.ButtonRoll')}`,
                        callback: async html => {
                            let isExtraAttack = html.find('[name=isExtraAttack]').prop('checked');

                            let location = html.find('[name=location]')[0].value;
                            let ammunition = undefined;
                            if (html.find('[name=ammunition]')[0]) {
                                ammunition = html.find('[name=ammunition]')[0].value;
                            }

                            let targetOutsideLOS = html.find('[name=targetOutsideLOS]').prop('checked');
                            let outsideLOS = html.find('[name=outsideLOS]').prop('checked');
                            let isFastDraw = html.find('[name=isFastDraw]').prop('checked');
                            let isProne = html.find('[name=isProne]').prop('checked');
                            let isPinned = html.find('[name=isPinned]').prop('checked');
                            let isActivelyDodging = html.find('[name=isActivelyDodging]').prop('checked');
                            let isMoving = html.find('[name=isMoving]').prop('checked');
                            let isAmbush = html.find('[name=isAmbush]').prop('checked');
                            let isRicochet = html.find('[name=isRicochet]').prop('checked');
                            let isBlinded = html.find('[name=isBlinded]').prop('checked');
                            let isSilhouetted = html.find('[name=isSilhouetted]').prop('checked');
                            let customAim = html.find('[name=customAim]')[0].value;

                            let range = weapon.system.range ? html.find('[name=range]')[0].value : null;
                            let customAtt = html.find('[name=customAtt]')[0].value;
                            let strike = html.find('[name=strike]')[0].value;
                            let damageType = html.find('[name=damageType]')[0].value;
                            let customDmg = html.find('[name=customDmg]')[0].value;
                            let attacknumber = 1;

                            let damage = weapon.createBaseDamageObject();
                            damage = {
                                ...damage,
                                strike: strike,
                                type: damageType
                            };

                            if (isExtraAttack) {
                                let newSta = this.system.derivedStats.sta.value - 3;

                                if (newSta < 0) {
                                    return ui.notifications.error(game.i18n.localize('WITCHER.Spell.notEnoughSta'));
                                }
                                this.update({
                                    'system.derivedStats.sta.value': newSta
                                });
                            }

                            let allEffects = foundry.utils.deepClone(weapon.system.damageProperties.effects);
                            if (ammunition) {
                                let item = this.items.get(ammunition);
                                let newQuantity = item.system.quantity - 1;
                                item.update({ 'system.quantity': newQuantity });
                                allEffects.push(...item.system.damageProperties.effects);
                                damage.ammunition = item;
                            }

                            if (weapon.isWeaponThrowable()) {
                                let newQuantity = weapon.system.quantity - 1;
                                if (newQuantity < 0) {
                                    return;
                                }
                                weapon.update({ 'system.quantity': newQuantity });
                            }

                            weapon.system.enhancementItems?.forEach(element => {
                                if (element && JSON.stringify(element) != '{}') {
                                    let enhancement = this.items.get(element.id);
                                    allEffects.push(...enhancement.system.effects);
                                }
                            });

                            damage.damageProperties.effects = allEffects;

                            if (strike == 'fast') {
                                attacknumber = 2;
                            }
                            for (let i = 0; i < attacknumber; i++) {
                                let attFormula = '1d10+';
                                let skill = CONFIG.WITCHER.skillMap[attackSkill.name];
                                if (game.settings.get('TheWitcherTRPG', 'woundsAffectSkillBase')) {
                                    attFormula += '(';
                                }
                                attFormula += !displayRollDetails
                                    ? `${this.system.stats[skill.attribute.name].current}+${this.system.skills[skill.attribute.name][skill.name].value}`
                                    : `${this.system.stats[skill.attribute.name].current}[${game.i18n.localize(skill.attribute.label)}]+${this.system.skills[skill.attribute.name][skill.name].value}[${game.i18n.localize(skill.label)}]`;

                                attFormula = this.handleSpecialModifier(attFormula, strike);
                                attFormula += this.addAllModifiers(attackSkill.name);

                                if (weapon.system.accuracy < 0) {
                                    attFormula += !displayRollDetails
                                        ? `${weapon.system.accuracy}`
                                        : `${weapon.system.accuracy}[${game.i18n.localize('WITCHER.Weapon.Short.WeaponAccuracy')}]`;
                                }
                                if (weapon.system.accuracy > 0) {
                                    attFormula += !displayRollDetails
                                        ? `+${weapon.system.accuracy}`
                                        : `+${weapon.system.accuracy}[${game.i18n.localize('WITCHER.Weapon.Short.WeaponAccuracy')}]`;
                                }
                                if (targetOutsideLOS) {
                                    attFormula += !displayRollDetails
                                        ? `-3`
                                        : `-3[${game.i18n.localize('WITCHER.Dialog.attackTargetOutsideLOS')}]`;
                                }
                                if (outsideLOS) {
                                    attFormula += !displayRollDetails
                                        ? `+3`
                                        : `+3[${game.i18n.localize('WITCHER.Dialog.attackOutsideLOS')}]`;
                                }
                                if (isExtraAttack) {
                                    attFormula += !displayRollDetails
                                        ? `-3`
                                        : `-3[${game.i18n.localize('WITCHER.Dialog.attackExtra')}]`;
                                }
                                if (isFastDraw) {
                                    attFormula += !displayRollDetails
                                        ? `-3`
                                        : `-3[${game.i18n.localize('WITCHER.Dialog.attackIsFastDraw')}]`;
                                }
                                if (isProne) {
                                    attFormula += !displayRollDetails
                                        ? `-2`
                                        : `-2[${game.i18n.localize('WITCHER.Dialog.attackIsProne')}]`;
                                }
                                if (isPinned) {
                                    attFormula += !displayRollDetails
                                        ? `+4`
                                        : `+4[${game.i18n.localize('WITCHER.Dialog.attackIsPinned')}]`;
                                }
                                if (isActivelyDodging) {
                                    attFormula += !displayRollDetails
                                        ? `-2`
                                        : `-2[${game.i18n.localize('WITCHER.Dialog.attackIsActivelyDodging')}]`;
                                }
                                if (isMoving) {
                                    attFormula += !displayRollDetails
                                        ? `-3`
                                        : `-3[${game.i18n.localize('WITCHER.Dialog.attackIsMoving')}]`;
                                }
                                if (isAmbush) {
                                    attFormula += !displayRollDetails
                                        ? `+5`
                                        : `+5[${game.i18n.localize('WITCHER.Dialog.attackIsAmbush')}]`;
                                }
                                if (isRicochet) {
                                    attFormula += !displayRollDetails
                                        ? `-5`
                                        : `-5[${game.i18n.localize('WITCHER.Dialog.attackIsRicochet')}]`;
                                }
                                if (isBlinded) {
                                    attFormula += !displayRollDetails
                                        ? `-3`
                                        : `-3[${game.i18n.localize('WITCHER.Dialog.attackIsBlinded')}]`;
                                }
                                if (isSilhouetted) {
                                    attFormula += !displayRollDetails
                                        ? `+2`
                                        : `+2[${game.i18n.localize('WITCHER.Dialog.attackIsSilhouetted')}]`;
                                }
                                if (customAim > 0) {
                                    attFormula += !displayRollDetails
                                        ? `+${customAim}`
                                        : `+${customAim}[${game.i18n.localize('WITCHER.Dialog.attackCustom')}]`;
                                }

                                if (customAtt != '0') {
                                    attFormula += !displayRollDetails
                                        ? `+${customAtt}`
                                        : `+${customAtt}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                                }

                                switch (range) {
                                    case 'pointBlank':
                                        attFormula = !displayRollDetails
                                            ? `${attFormula}+5`
                                            : `${attFormula} +5[${game.i18n.localize('WITCHER.Weapon.Range')}]`;
                                        break;
                                    case 'medium':
                                        attFormula = !displayRollDetails
                                            ? `${attFormula}-2`
                                            : `${attFormula} -2[${game.i18n.localize('WITCHER.Weapon.Range')}]`;
                                        break;
                                    case 'long':
                                        attFormula = !displayRollDetails
                                            ? `${attFormula}-4`
                                            : `${attFormula} -4[${game.i18n.localize('WITCHER.Weapon.Range')}]`;
                                        break;
                                    case 'extreme':
                                        attFormula = !displayRollDetails
                                            ? `${attFormula}-6`
                                            : `${attFormula} -6[${game.i18n.localize('WITCHER.Weapon.Range')}]`;
                                        break;
                                }

                                if (customDmg != '0') {
                                    damageFormula += !displayRollDetails
                                        ? `+${customDmg}`
                                        : `+${customDmg}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                                }
                                damage.formula = damageFormula;

                                let touchedLocation = this.getLocationObject(location);
                                attFormula += !displayRollDetails
                                    ? `${touchedLocation.modifier}`
                                    : `${touchedLocation.modifier}[${touchedLocation.alias}]`;
                                damage.location = touchedLocation;
                                damage.originalLocation = location;

                                if (strike == 'joint') {
                                    attFormula = !displayRollDetails
                                        ? `${attFormula} -3${
                                              this.system.lifepathModifiers.jointStrikeAttackBonus > 0
                                                  ? ` +${this.system.lifepathModifiers.jointStrikeAttackBonus}`
                                                  : ''
                                          }`
                                        : `${attFormula} -3[${game.i18n.localize('WITCHER.Dialog.attackStrike')}]${
                                              this.system.lifepathModifiers.jointStrikeAttackBonus > 0
                                                  ? ` +${this.system.lifepathModifiers.jointStrikeAttackBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                                                  : ''
                                          }`;
                                }

                                if (strike == 'strong') {
                                    if (!displayRollDetails) {
                                        attFormula = `${attFormula} -3${
                                            this.system.lifepathModifiers.strongStrikeAttackBonus > 0
                                                ? ` +${this.system.lifepathModifiers.strongStrikeAttackBonus}`
                                                : ''
                                        }`;
                                    } else {
                                        attFormula = `${attFormula} -3[${game.i18n.localize('WITCHER.Dialog.attackStrike')}]${
                                            this.system.lifepathModifiers.strongStrikeAttackBonus > 0
                                                ? ` +${this.system.lifepathModifiers.strongStrikeAttackBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                                                : ''
                                        }`;
                                    }
                                }

                                messageData.flavor = `<div class="attack-message"><h1><img src="${weapon.img}" class="item-img" />${game.i18n.localize('WITCHER.Attack')}: ${weapon.name}</h1>`;
                                messageData.flavor += `<span>  ${game.i18n.localize('WITCHER.Armor.Location')}: ${touchedLocation.alias} </span>`;

                                messageData.flavor += `<button class="damage">${game.i18n.localize('WITCHER.table.Damage')}</button>`;
                                if (weapon.system.rollOnlyDmg) {
                                    rollDamage(weapon, damage);
                                } else {
                                    messageData.flags = {
                                        TheWitcherTRPG: {
                                            attack: weapon.getAttackSkillFlags(),
                                            damage: damage
                                        }
                                    };
                                    await extendedRoll(attFormula, messageData, new RollConfig());
                                }
                            }
                        }
                    }
                }
            },
            myDialogOptions
        ).render(true);
    }
};
