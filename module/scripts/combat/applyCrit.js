import { getInteractActor, getRandomInt } from '../helper.js';
import { applyDamage } from './applyDamage.js';

export function addCritMessageContextOptions(html, options) {
    let wasCritted = li => li.find('.crit-taken').length;
    options.push(
        {
            name: `${game.i18n.localize('WITCHER.Context.applyCritDmg')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: wasCritted,
            callback: async li => {
                applyCritDamage(await getInteractActor(), li[0].dataset.messageId);
            }
        },
        {
            name: `${game.i18n.localize('WITCHER.Context.applyBonusCritDmg')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: wasCritted,
            callback: async li => {
                applyBonusCritDamage(await getInteractActor(), li[0].dataset.messageId);
            }
        },
        {
            name: `${game.i18n.localize('WITCHER.Context.applyCritWound')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: wasCritted,
            callback: async li => {
                applyCritWound(await getInteractActor(), li[0].dataset.messageId);
            }
        }
    );
    return options;
}

async function applyCritDamage(actor, messageId) {
    let crit = game.messages.get(messageId).getFlag('TheWitcherTRPG', 'crit');

    applyDamage(
        actor,
        null,
        crit.critdamage,
        { damageProperties: { bypassesNaturalArmor: true, bypassesWornArmor: true } },
        actor.getLocationObject('torso'),
        'hp'
    );
}

async function applyBonusCritDamage(actor, messageId) {
    let crit = game.messages.get(messageId).getFlag('TheWitcherTRPG', 'crit');

    applyDamage(
        actor,
        null,
        crit.bonusdamage,
        { damageProperties: { bypassesNaturalArmor: true, bypassesWornArmor: true } },
        actor.getLocationObject('torso'),
        'hp'
    );
}

async function applyCritWound(actor, messageId) {
    let crit = game.messages.get(messageId).getFlag('TheWitcherTRPG', 'crit');

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

    const critList = actor.system.critWounds;
    critList.push({
        id: foundry.utils.randomID(),
        configEntry: wound,
        location: crit.location.name
    });
    actor.update({ 'system.critWounds': critList });

    const chatData = {
        content: `<div>${game.i18n.localize(CONFIG.WITCHER.Crit[wound].label)}</div><div>${game.i18n.localize(CONFIG.WITCHER.Crit[wound].description)}</div>`,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        type: CONST.CHAT_MESSAGE_STYLES.OTHER
    };
    ChatMessage.create(chatData);
}
