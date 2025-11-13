import { extendedRoll } from '../../scripts/rolls/extendedRoll.js';
import { RollConfig } from '../../scripts/rollConfig.js';
import ChatMessageData from '../../chatMessage/chatMessageData.js';

const DialogV2 = foundry.applications.api.DialogV2;

export let professionMixin = {
    calc_total_skills_profession() {
        let totalSkills = 0;
        let profession = this.getList('profession')[0];
        if (profession) {
            totalSkills += Number(profession.system.definingSkill.level);
            totalSkills +=
                Number(profession.system.skillPath1.skill1.level) +
                Number(profession.system.skillPath1.skill2.level) +
                Number(profession.system.skillPath1.skill3.level);
            totalSkills +=
                Number(profession.system.skillPath2.skill1.level) +
                Number(profession.system.skillPath2.skill2.level) +
                Number(profession.system.skillPath2.skill3.level);
            totalSkills +=
                Number(profession.system.skillPath3.skill1.level) +
                Number(profession.system.skillPath3.skill2.level) +
                Number(profession.system.skillPath3.skill3.level);
        }
        return totalSkills;
    },

    async _onProfessionRoll(event) {
        let name = event.currentTarget.closest('.profession-display').dataset.name;
        let skill = this.findSkillWithName(name).skill;

        if (skill.skillAttack.isAttack) {
            this.doProfessionAttackRoll(skill);
        } else {
            this.doProfessionSkillRoll(skill);
        }
    },

    async doProfessionAttackRoll(skill) {
        let skillAttack = skill.skillAttack;

        if (skillAttack.usesWeapon) {
            return this.doProfessionWeaponAttackRoll(skill);
        }

        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let displayDmgFormula = `${skillAttack.damageFormulaOverride}`;
        let damageFormula = !displayRollDetails
            ? `${skillAttack.damageFormulaOverride}`
            : `${skillAttack.damageFormulaOverride}[${skill.skillName}]`;

        if (skillAttack.applyMeleeBonus && (this.type == 'character' || this.system.addMeleeBonus)) {
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

        let attack = {
            attackOption: [...skillAttack.attackOptions][0],
            skill: skill.skillName,
            alias: skill.skillName
        };
        let messageDataFlavor = `<h1> ${game.i18n.localize('WITCHER.Dialog.attack')}: ${skill.skillName}</h1>`;

        let meleeBonus = skillAttack.applyMeleeBonus ? this.system.attackStats.meleeBonus : 0;
        let data = {
            attackSkill: attack,
            displayDmgFormula,
            meleeBonus: meleeBonus,
            config: CONFIG.WITCHER
        };

        const dialogTemplate = await renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/combat/profession-attack.hbs',
            data
        );

        let {
            isExtraAttack,
            location,
            targetOutsideLOS,
            outsideLOS,
            isProne,
            isPinned,
            isActivelyDodging,
            isMoving,
            isAmbush,
            isBlinded,
            isSilhouetted,
            customAtt,
            damageType,
            customDmg
        } = await DialogV2.prompt({
            window: {
                title: `${game.i18n.localize('WITCHER.Dialog.attackWith')}: ${skill.skillName}`,
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

                        targetOutsideLOS: button.form.elements.targetOutsideLOS.checked,
                        outsideLOS: button.form.elements.outsideLOS.checked,
                        isProne: button.form.elements.isProne.checked,
                        isPinned: button.form.elements.isPinned.checked,
                        isActivelyDodging: button.form.elements.isActivelyDodging.checked,
                        isMoving: button.form.elements.isMoving.checked,
                        isAmbush: button.form.elements.isAmbush.checked,
                        isBlinded: button.form.elements.isBlinded.checked,
                        isSilhouetted: button.form.elements.isSilhouetted.checked,

                        customAtt: button.form.elements.customAtt.value,
                        damageType: button.form.elements.damageType.value,
                        customDmg: button.form.elements.customDmg.value
                    };
                }
            },
            rejectClose: true
        });

        let damage = {
            properties: foundry.utils.deepClone(skillAttack.damageProperties),
            item: { name: skill.skillName },
            crit: {
                critLocationModifier: this.system.attackStats.critLocationModifier,
                critEffectModifier: this.system.attackStats.critEffectModifier
            },
            defenseOptions: foundry.utils.deepClone(skillAttack.defenseOptions)
        };
        damage.type = damageType;

        let attFormula = '1d10+';
        attFormula += !displayRollDetails
            ? `${this.system.stats[skill.stat].value}+${skill.level ?? 0}`
            : `${this.system.stats[skill.stat].value}[${game.i18n.localize(CONFIG.WITCHER.statMap[skill.stat].label)}]+${skill.level ?? 0}[${skill.skillName}]`;

        attFormula += this.addAllModifiers(attack.name);

        if (targetOutsideLOS) {
            attFormula += !displayRollDetails
                ? `-3`
                : `-3[${game.i18n.localize('WITCHER.Dialog.attackTargetOutsideLOS')}]`;
        }
        if (outsideLOS) {
            attFormula += !displayRollDetails ? `+3` : `+3[${game.i18n.localize('WITCHER.Dialog.attackOutsideLOS')}]`;
        }
        if (isExtraAttack) {
            attFormula += !displayRollDetails ? `-3` : `-3[${game.i18n.localize('WITCHER.Dialog.attackExtra')}]`;
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
        if (isBlinded) {
            attFormula += !displayRollDetails ? `-3` : `-3[${game.i18n.localize('WITCHER.Dialog.attackIsBlinded')}]`;
        }
        if (isSilhouetted) {
            attFormula += !displayRollDetails
                ? `+2`
                : `+2[${game.i18n.localize('WITCHER.Dialog.attackIsSilhouetted')}]`;
        }

        if (customAtt != '0') {
            attFormula += !displayRollDetails
                ? `+${customAtt}`
                : `+${customAtt}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
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

        messageDataFlavor = `<div class="attack-message"><h1>${game.i18n.localize('WITCHER.Attack.name')}: ${skill.skillName}</h1>`;
        messageDataFlavor += `<span>  ${game.i18n.localize('WITCHER.Armor.Location')}: ${touchedLocation.alias} </span>`;

        messageDataFlavor += `<button class="damage">${game.i18n.localize('WITCHER.table.Damage')}</button>`;

        let messageData = new ChatMessageData(this, messageDataFlavor, 'attack', {
            attacker: this.uuid,
            attack: attack,
            damage: damage,
            defenseOptions: skillAttack.defenseOptions
        });

        await extendedRoll(attFormula, messageData);
    },

    async doProfessionWeaponAttackRoll(skill) {
        let weapons = this.items
            .filter(item => item.type === 'weapon')
            .filter(weapon => weapon.system.attackOptions.has([...skill.skillAttack.attackOptions][0]));

        let options = '';
        weapons.forEach(
            weapon =>
                (options += `<option value="${weapon.id}" data-itemId="${weapon.itemId}"> ${weapon.name}</option>`)
        );

        let chooserContent = `<select name="choosen">${options}</select>`;
        let itemId = await DialogV2.prompt({
            window: { title: `` },
            content: chooserContent,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.choosen.value;
                }
            },
            rejectClose: true
        });

        let weapon = this.items.get(itemId);
        this.weaponAttack(weapon, {
            skillReplacement: skill,
            additionalDamageProperties: skill.skillAttack.damageProperties
        });
    },

    async doProfessionSkillRoll(skill) {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');
        let stat = skill.stat;
        let level = skill.level || 0;

        let definition = skill.definition;
        let statValue = this.system.stats[stat].value;
        let statName = CONFIG.WITCHER.statMap[stat].label;

        let rollFormula = !displayRollDetails
            ? `1d10+${statValue}+${level}`
            : `1d10+${statValue}[${game.i18n.localize(statName)}]+${level}[${skill.skillName}]`;

        let customMod = await DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.Dialog.profession.skill')}: ${skill.skillName}` },
            content: `<label>${game.i18n.localize('WITCHER.Dialog.attackCustom')}: <input name="customModifiers" value=0></label>`,
            modal: true,
            ok: {
                callback: (event, button, dialog) => button.form.elements.customModifiers.value
            },
            rejectClose: true
        });

        if (customMod < 0) {
            rollFormula += !displayRollDetails
                ? `${customMod}`
                : `${customMod}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
        }
        if (customMod > 0) {
            rollFormula += !displayRollDetails
                ? `+${customMod}`
                : `+${customMod}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
        }

        let messageData = new ChatMessageData(this.actor, `<h2>${skill.skillName}</h2>${definition}`);

        let config = new RollConfig();
        config.showCrit = true;
        extendedRoll(rollFormula, messageData, config);
    },

    findSkillWithName(skillName) {
        let profession = this.getList('profession')[0];

        if (profession.system.definingSkill.skillName === skillName) {
            return { skill: profession.system.definingSkill, path: 'definingSkill' };
        }

        if (this.findSkillWithNameInSkillPath(profession.system.skillPath1, skillName)) {
            let skill = this.findSkillWithNameInSkillPath(profession.system.skillPath1, skillName);
            return { skill: skill.skill, path: 'skillPath1.' + skill.path };
        }
        if (this.findSkillWithNameInSkillPath(profession.system.skillPath2, skillName)) {
            let skill = this.findSkillWithNameInSkillPath(profession.system.skillPath2, skillName);
            return { skill: skill.skill, path: 'skillPath2.' + skill.path };
        }
        if (this.findSkillWithNameInSkillPath(profession.system.skillPath3, skillName)) {
            let skill = this.findSkillWithNameInSkillPath(profession.system.skillPath3, skillName);
            return { skill: skill.skill, path: 'skillPath3.' + skill.path };
        }
    },

    findSkillWithNameInSkillPath(skillPath, skillName) {
        if (skillPath.skill1.skillName === skillName) {
            return { skill: skillPath.skill1, path: 'skill1' };
        }
        if (skillPath.skill2.skillName === skillName) {
            return { skill: skillPath.skill2, path: 'skill2' };
        }
        if (skillPath.skill3.skillName === skillName) {
            return { skill: skillPath.skill3, path: 'skill3' };
        }

        return null;
    }
};
