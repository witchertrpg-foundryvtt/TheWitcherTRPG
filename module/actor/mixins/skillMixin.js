import ChatMessageData from "../../chatMessage/chatMessageData.js";
import { getCustomModifier } from "../../scripts/helper.js";
import { RollConfig } from "../../scripts/rollConfig.js";
import { extendedRoll } from "../../scripts/rolls/extendedRoll.js";

export let skillMixin = {
    async levelUpSkill(skillName) {
        let skillMapEntry = CONFIG.WITCHER.skillMap[skillName];
        let attribute = skillMapEntry.attribute;
        let skillValue = this.system.skills[attribute.name][skillName].value;

        let isMagical = CONFIG.WITCHER.magicSkills.includes(skillName);

        let levelUpCost = Math.max(skillValue, 1) * (skillMapEntry.costMultiplier ?? 1);
        let magicalCost = 0;

        let logLabel = game.i18n.localize(skillMapEntry.label) + ' ' + skillValue + ' -> ' + (skillValue + 1);

        if (isMagical) {
            let magicalIp = this.system.magic.magicImprovementPoints;
            let magicalCost = levelUpCost;

            if (magicalIp < levelUpCost) {
                magicalCost = magicalIp;
            }
            levelUpCost -= magicalCost;

            this.system.logs.addIpReward(logLabel, magicalCost * -1, true);
        }

        if (levelUpCost) {
            this.system.logs.addIpReward(logLabel, levelUpCost * -1, false);
        }

        this.update({
            [`system.skills.${attribute.name}.${skillName}.value`]: ++skillValue,
            'system.magic.magicImprovementPoints': this.system.magic.magicImprovementPoints - magicalCost,
            'system.improvementPoints': this.system.improvementPoints - levelUpCost
        });
    },

    async rollSkill(skillName, threshold = -1) {
        return this.rollSkillCheck(CONFIG.WITCHER.skillMap[skillName], threshold);
    },

    async rollSkillCheck(skillMapEntry, threshold = -1) {
        let attribute = skillMapEntry.attribute;
        let attributeLabel = game.i18n.localize(attribute.label);
        let attributeValue = this.system.stats[attribute.name].value;

        let skillName = skillMapEntry.name;
        let skillLabel = game.i18n.localize(skillMapEntry.rollLabel ?? skillMapEntry.label);
        let skillValue = this.system.skills[attribute.name][skillName].value;

        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let messageData = new ChatMessageData(this, `${attributeLabel}: ${skillLabel} Check`);

        let rollFormula = '1d10 +';
        if (game.settings.get('TheWitcherTRPG', 'woundsAffectSkillBase')) {
            rollFormula += '(';
        }
        if (!this.system.dontAddAttr) {
            rollFormula += !displayRollDetails ? `${attributeValue} +` : `${attributeValue}[${attributeLabel}] +`;
        }

        rollFormula += !displayRollDetails ? `${skillValue}` : `${skillValue}[${skillLabel}]`;
        rollFormula += this.addAllModifiers(skillMapEntry.name);

        rollFormula += this.addSocialStanding(attribute, skillName);

        let armorEnc = this.getArmorEcumbrance();
        if (armorEnc > 0 && (skillName == 'hexweave' || skillName == 'ritcraft' || skillName == 'spellcast')) {
            rollFormula += !displayRollDetails
                ? `-${armorEnc}`
                : `-${armorEnc}[${game.i18n.localize('WITCHER.Armor.EncumbranceValue')}]`;
        }

        rollFormula += await getCustomModifier(`${game.i18n.localize('WITCHER.Dialog.Skill')}: ${skillLabel}`);

        let config = new RollConfig();
        config.showCrit = true;
        config.showSuccess = true;
        config.threshold = threshold;
        return extendedRoll(rollFormula, messageData, config);
    },

    addSocialStanding(attribute, skillName) {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        const tolerated = ['tolerated', 'toleratedFeared'];
        const feared = ['feared', 'toleratedFeared', 'hatedFeared'];
        const hated = ['hated', 'hatedFeared'];

        let socialModifiers = '';
        if (this.type == 'character') {
            // core rulebook page 21
            if (attribute.name == 'emp') {
                if (
                    skillName == 'charisma' ||
                    skillName == 'leadership' ||
                    skillName == 'persuasion' ||
                    skillName == 'seduction'
                ) {
                    if (tolerated.includes(this.system.general.socialStanding)) {
                        socialModifiers += !displayRollDetails
                            ? `-1`
                            : `-1[${game.i18n.localize('WITCHER.socialStanding.tolerated')}]`;
                    } else if (hated.includes(this.system.general.socialStanding)) {
                        socialModifiers += !displayRollDetails
                            ? `-2`
                            : `-2[${game.i18n.localize('WITCHER.socialStanding.hated')}]`;
                    }
                }

                if (skillName == 'charisma' && feared.includes(this.system.general.socialStanding)) {
                    socialModifiers += !displayRollDetails
                        ? `-1`
                        : `-1[${game.i18n.localize('WITCHER.socialStanding.feared')}]`;
                }
            }

            if (
                attribute.name == 'will' &&
                skillName == 'intimidation' &&
                feared.includes(this.system.general.socialStanding)
            ) {
                socialModifiers += !displayRollDetails
                    ? `+1`
                    : `+1[${game.i18n.localize('WITCHER.socialStanding.feared')}]`;
            }
        }

        return socialModifiers;
    },

    async rollCustomSkillCheck(event) {
        let customSkill = this.items.find(item => item.id == event.currentTarget.closest('.item').dataset.itemId);

        let attribute = CONFIG.WITCHER.statMap[customSkill.system.attribute];
        let attributeLabel = game.i18n.localize(attribute.label);
        let attributeValue = this.system.stats[attribute.name].value;

        let skillLabel = customSkill.name;
        let skillValue = customSkill.system.value;

        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let messageData = new ChatMessageData(this, `${attributeLabel}: ${skillLabel} Check`);

        let rollFormula;
        if (this.system.dontAddAttr) {
            rollFormula = !displayRollDetails ? `1d10+${skillValue}` : `1d10+${skillValue}[${skillLabel}]`;
        } else {
            rollFormula = !displayRollDetails
                ? `1d10+${attributeValue}+${skillValue}`
                : `1d10+${attributeValue}[${attributeLabel}]+${skillValue}[${skillLabel}]`;
        }

        rollFormula += this.addAllModifiers(customSkill.name);
        customSkill.system.modifiers?.forEach(mod => {
            if (mod.value < 0) {
                rollFormula += !displayRollDetails ? ` ${mod.value}` : ` ${mod.value}[${mod.name}]`;
            }
            if (mod.value > 0) {
                rollFormula += !displayRollDetails ? ` +${mod.value}` : ` +${mod.value}[${mod.name}]`;
            }
        });

        rollFormula += await getCustomModifier(`${game.i18n.localize('WITCHER.Dialog.Skill')}: ${skillLabel}`);

        let config = new RollConfig();
        config.showCrit = true;
        config.showSuccess = true;
        return extendedRoll(rollFormula, messageData, config);
    }
};
