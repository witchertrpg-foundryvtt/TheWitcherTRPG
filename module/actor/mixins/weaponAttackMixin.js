import ChatMessageData from '../../chatMessage/chatMessageData.js';
import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';

const DialogV2 = foundry.applications.api.DialogV2;

export let weaponAttackMixin = {
    async weaponAttack(weapon, options = {}) {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let displayDmgFormula = `${weapon.system.damage}`;
        let damageFormula = !displayRollDetails
            ? `${weapon.system.damage}`
            : `${weapon.system.damage}[${game.i18n.localize('WITCHER.Diagram.Weapon')}]`;

        if (weapon.system.applyMeleeBonus && (this.type == 'character' || this.system.addMeleeBonus)) {
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
        }

        let attack = weapon.getItemAttack(options);
        if (options.skillReplacement) {
            attack.skill = options.skillReplacement.skillName;
            attack.alias = options.skillReplacement.skillName;
        }

        if (!attack.skill) {
            return ui.notifications.error(`${game.i18n.localize('WITCHER.Weapon.error.noAttackSkill')}`);
        }
        let messageDataFlavor = `<h1> ${game.i18n.localize('WITCHER.Dialog.attack')}: ${weapon.name}</h1>`;

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

        let noThrowable = !weapon.system.isEnoughThrowable();
        let meleeBonus = weapon.system.applyMeleeBonus ? this.system.attackStats.meleeBonus : 0;
        let data = {
            item: weapon,
            attackSkill: attack,
            displayDmgFormula,
            noAmmo,
            noThrowable,
            ammunitionOption,
            ammunitions,
            meleeBonus: meleeBonus
        };

        const dialogTemplate = await renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/combat/weapon-attack.hbs',
            data
        );

        let {
            isExtraAttack,
            location,
            ammunition,
            targetOutsideLOS,
            outsideLOS,
            isFastDraw,
            isProne,
            isPinned,
            isActivelyDodging,
            isMoving,
            isAmbush,
            isRicochet,
            isBlinded,
            isSilhouetted,
            customAim,
            range,
            customAtt,
            strike,
            damageType,
            customDmg
        } = await DialogV2.prompt({
            window: {
                title: `${game.i18n.localize('WITCHER.Dialog.attackWith')}: ${weapon.name}`,
                contentClasses: ['scrollable']
            },
            position: { width: 600 },
            content: dialogTemplate,
            modal: true,
            ok: {
                callback: (event, button, dialog) => {
                    return {
                        isExtraAttack: button.form.elements.isExtraAttack.checked,
                        location: button.form.elements.location.value,
                        ammunition: button.form.elements.ammunition?.value,

                        targetOutsideLOS: button.form.elements.targetOutsideLOS.checked,
                        outsideLOS: button.form.elements.outsideLOS.checked,
                        isFastDraw: button.form.elements.isFastDraw.checked,
                        isProne: button.form.elements.isProne.checked,
                        isPinned: button.form.elements.isPinned.checked,
                        isActivelyDodging: button.form.elements.isActivelyDodging.checked,
                        isMoving: button.form.elements.isMoving.checked,
                        isAmbush: button.form.elements.isAmbush.checked,
                        isRicochet: button.form.elements.isRicochet.checked,
                        isBlinded: button.form.elements.isBlinded.checked,
                        isSilhouetted: button.form.elements.isSilhouetted.checked,
                        customAim: button.form.elements.customAim.value,

                        range: weapon.system.range ? button.form.elements.range.value : null,
                        customAtt: button.form.elements.customAtt.value,
                        strike: button.form.elements.strike.value,
                        damageType: button.form.elements.damageType.value,
                        customDmg: button.form.elements.customDmg.value
                    };
                }
            }
        });

        let attacknumber = 1;
        let damage = weapon.createBaseDamageObject();
        let damageModifcation = '';
        if (options.additionalDamageProperties) {
            damageModifcation = this.mergeDamageProperties(damage.properties, options.additionalDamageProperties);
        }
        damage.strike = strike;
        damage.type = damageType;

        if (isExtraAttack) {
            let newSta = this.system.derivedStats.sta.value - 3;

            if (newSta < 0) {
                return ui.notifications.error(game.i18n.localize('WITCHER.Spell.notEnoughSta'));
            }
            this.update({
                'system.derivedStats.sta.value': newSta
            });
        }

        if (ammunition) {
            let item = this.items.get(ammunition);
            let newQuantity = item.system.quantity - 1;
            item.update({ 'system.quantity': newQuantity });
            damage.properties.effects.push(...item.system.damageProperties.effects);
            damage.ammunition = item;
        }

        if (weapon.isWeaponThrowable() && attack.attackOption === 'ranged') {
            let newQuantity = weapon.system.quantity - 1;
            if (newQuantity < 0) {
                return;
            }
            weapon.update({ 'system.quantity': newQuantity });
        }

        weapon.system.enhancementItems?.forEach(element => {
            if (element && JSON.stringify(element) != '{}') {
                let enhancement = this.items.get(element.id);
                damage.properties.effects.push(...enhancement.system.effects);
            }
        });

        if (strike == 'fast') {
            attacknumber = 2;
        }
        for (let i = 0; i < attacknumber; i++) {
            let attFormula = '1d10+';
            let skill = CONFIG.WITCHER.skillMap[attack.skill];
            if (game.settings.get('TheWitcherTRPG', 'woundsAffectSkillBase')) {
                attFormula += '(';
            }
            if (options.skillReplacement) {
                attFormula += !displayRollDetails
                    ? `${this.system.stats[options.skillReplacement.stat].current}+${options.skillReplacement.level ?? 0}`
                    : `${this.system.stats[options.skillReplacement.stat].current}[${game.i18n.localize(CONFIG.WITCHER.statMap[options.skillReplacement.stat].label)}]+${options.skillReplacement.level ?? 0}[${options.skillReplacement.skillName}]`;
            } else {
                attFormula += this.constructBaseAttackFormula(skill);
            }

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
                attFormula += !displayRollDetails ? `-3` : `-3[${game.i18n.localize('WITCHER.Dialog.attackExtra')}]`;
            }
            if (isFastDraw) {
                attFormula += !displayRollDetails
                    ? `-3`
                    : `-3[${game.i18n.localize('WITCHER.Dialog.attackIsFastDraw')}]`;
            }
            if (isProne) {
                attFormula += !displayRollDetails ? `-2` : `-2[${game.i18n.localize('WITCHER.Dialog.attackIsProne')}]`;
            }
            if (isPinned) {
                attFormula += !displayRollDetails ? `+4` : `+4[${game.i18n.localize('WITCHER.Dialog.attackIsPinned')}]`;
            }
            if (isActivelyDodging) {
                attFormula += !displayRollDetails
                    ? `-2`
                    : `-2[${game.i18n.localize('WITCHER.Dialog.attackIsActivelyDodging')}]`;
            }
            if (isMoving) {
                attFormula += !displayRollDetails ? `-3` : `-3[${game.i18n.localize('WITCHER.Dialog.attackIsMoving')}]`;
            }
            if (isAmbush) {
                attFormula += !displayRollDetails ? `+5` : `+5[${game.i18n.localize('WITCHER.Dialog.attackIsAmbush')}]`;
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
            damage.formula = damageFormula + damageModifcation;

            attFormula += this.handleAttackLocation(location, damage, displayRollDetails);
            attFormula += this.handleStrikeType(strike, displayRollDetails);

            messageDataFlavor = `<div class="attack-message"><h1><img src="${weapon.img}" class="item-img" />${game.i18n.localize('WITCHER.Attack.name')}: ${weapon.name}</h1>`;
            messageDataFlavor += `<span>  ${game.i18n.localize('WITCHER.Armor.Location')}: ${damage.location.alias} </span>`;

            messageDataFlavor += `<button class="damage">${game.i18n.localize('WITCHER.table.Damage')}</button>`;

            if (weapon.system.rollOnlyDmg) {
                weapon.rollDamage(damage);
            } else {
                let messageData = new ChatMessageData(this, messageDataFlavor, 'attack', {
                    attacker: this.uuid,
                    attack: attack,
                    damage: damage,
                    defenseOptions: weapon.system.defenseOptions
                });

                await extendedRoll(attFormula, messageData);
            }
        }
    },

    constructBaseAttackFormula(skill) {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let attFormula = !displayRollDetails
            ? `${this.system.stats[skill.attribute.name].current}+${this.system.skills[skill.attribute.name][skill.name].value}`
            : `${this.system.stats[skill.attribute.name].current}[${game.i18n.localize(skill.attribute.label)}]+${this.system.skills[skill.attribute.name][skill.name].value}[${game.i18n.localize(skill.label)}]`;

        attFormula += this.addAllModifiers(skill.name);
        attFormula += this.addAttackModifiers();

        return attFormula;
    },

    mergeDamageProperties(properties, additionalProperties) {
        let damageModification = '';

        //upgrading of AP
        if (
            properties.armorPiercing &&
            (additionalProperties.armorPiercing || additionalProperties.improvedArmorPiercing)
        ) {
            properties.improvedArmorPiercing = true;
        }

        if (
            properties.improvedArmorPiercing &&
            (additionalProperties.armorPiercing || additionalProperties.improvedArmorPiercing)
        ) {
            damageModification = '+3d6';
        }

        //generic handling
        for (let key in properties) {
            if (typeof properties[key] === 'boolean') properties[key] = properties[key] || additionalProperties[key];
            if (typeof properties[key] === 'number') properties[key] = properties[key] + additionalProperties[key];
            if (typeof properties[key] === 'string') properties[key] = properties[key] + additionalProperties[key];
            if (Array.isArray(properties[key])) properties[key].push(...additionalProperties[key]);
        }

        return damageModification;
    },

    handleAttackLocation(location, damage, displayRollDetails) {
        let touchedLocation = this.getLocationObject(location);
        damage.location = touchedLocation;
        damage.originalLocation = location;

        return !displayRollDetails
            ? `${touchedLocation.modifier}`
            : `${touchedLocation.modifier}[${touchedLocation.alias}]`;
    },

    handleStrikeType(strike, displayRollDetails) {
        if (strike == 'joint') {
            return !displayRollDetails
                ? ` -3${
                      this.system.lifepathModifiers.jointStrikeAttackBonus > 0
                          ? ` +${this.system.lifepathModifiers.jointStrikeAttackBonus}`
                          : ''
                  }`
                : ` -3[${game.i18n.localize('WITCHER.Dialog.attackStrike')}]${
                      this.system.lifepathModifiers.jointStrikeAttackBonus > 0
                          ? ` +${this.system.lifepathModifiers.jointStrikeAttackBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                          : ''
                  }`;
        }

        if (strike == 'strong') {
            if (!displayRollDetails) {
                return ` -3${
                    this.system.lifepathModifiers.strongStrikeAttackBonus > 0
                        ? ` +${this.system.lifepathModifiers.strongStrikeAttackBonus}`
                        : ''
                }`;
            } else {
                return ` -3[${game.i18n.localize('WITCHER.Dialog.attackStrike')}]${
                    this.system.lifepathModifiers.strongStrikeAttackBonus > 0
                        ? ` +${this.system.lifepathModifiers.strongStrikeAttackBonus}[${game.i18n.localize('WITCHER.Actor.Lifepath.Bonus')}]`
                        : ''
                }`;
            }
        }

        return '';
    }
};
