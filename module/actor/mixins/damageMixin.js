import { applyDamage } from '../../scripts/combat/applyDamage.js';
import { getRandomInt } from '../../scripts/helper.js';

export let damageMixin = {
    async applyCritDamage(crit) {
        applyDamage(
            this,
            null,
            crit.critdamage,
            { damageProperties: { bypassesNaturalArmor: true, bypassesWornArmor: true }, location: this.getLocationObject('torso') },
            'hp'
        );
    },

    async applyBonusCritDamage(crit) {
        applyDamage(
            this,
            null,
            crit.bonusdamage,
            { damageProperties: { bypassesNaturalArmor: true, bypassesWornArmor: true }, location: this.getLocationObject('torso') },
            'hp'
        );
    },

    async applyCritWound(crit) {
        let location = crit.location;
        let possibleWounds = [];

        for (let [woundName, woundConfig] of Object.entries(CONFIG.WITCHER.Crit)) {
            if (woundConfig.location.includes(location.name) && woundConfig.severity == crit.severity) {
                possibleWounds.push(woundName);
            }
        }

        let wound;

        if (possibleWounds.length == 1) {
            wound = possibleWounds[0];
        } else {
            let woundRoll = crit.location.critEffect ?? getRandomInt(6) + crit.critEffectModifier;
            if (woundRoll > 4) {
                wound = possibleWounds[0];
            } else {
                wound = possibleWounds[1];
            }
        }

        const critList = this.system.critWounds;
        critList.push({
            configEntry: wound,
            location: crit.location.name
        });
        this.update({ 'system.critWounds': critList });

        const chatData = {
            content: `<div>${game.i18n.localize(CONFIG.WITCHER.Crit[wound].label)}</div><div>${game.i18n.localize(CONFIG.WITCHER.Crit[wound].description)}</div>`,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };
        ChatMessage.create(chatData);
    }
};
