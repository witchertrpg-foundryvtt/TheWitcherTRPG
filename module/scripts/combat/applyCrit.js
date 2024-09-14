import { getInteractActor, getRandomInt } from '../helper.js';

export function addCritMessageContextOptions(html, options) {
    let wasCritted = li => li.find('.crit-taken').length;
    options.push(
        {
            name: `${game.i18n.localize('WITCHER.Context.applyCritDmg')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: wasCritted,
            callback: async li => {
                applyCritDamage(
                    await getInteractActor(),
                    li[0].dataset.messageId
                );
            }
        },
        {
            name: `${game.i18n.localize('WITCHER.Context.applyBonusCritDmg')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: wasCritted,
            callback: async li => {
                applyBonusCritDamage(
                    await getInteractActor(),
                    li[0].dataset.messageId
                );
            }
        },
        {
            name: `${game.i18n.localize('WITCHER.Context.applyCritWound')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: wasCritted,
            callback: async li => {
                applyCritWound(
                    await getInteractActor(),
                    li[0].dataset.messageId
                );
            }
        }
    );
    return options;
}

async function applyCritDamage(actor, messageId) {
    let crit = game.messages.get(messageId).getFlag('TheWitcherTRPG', 'crit');

    actor?.update({
        [`system.derivedStats.hp.value`]:
            actor.system.derivedStats.hp.value - crit.critdamage
    });
}

async function applyBonusCritDamage(actor, messageId) {
    let crit = game.messages.get(messageId).getFlag('TheWitcherTRPG', 'crit');

    actor?.update({
        [`system.derivedStats.hp.value`]:
            actor.system.derivedStats.hp.value - crit.bonusdamage
    });
}

async function applyCritWound(actor, messageId) {
    let crit = game.messages.get(messageId).getFlag('TheWitcherTRPG', 'crit');

    let location = crit.location;
    let possibleWounds = [];

    for (let [woundName, woundConfig] of Object.entries(CONFIG.WITCHER.Crit)) {
        if (
            woundConfig.location.includes(location.name) &&
            woundConfig.severity == crit.severity
        ) {
            possibleWounds.push(woundName);
        }
    }

    let wound;

    if (possibleWounds.length == 1) {
        wound = possibleWounds[0];
    } else {
        let woundRoll = getRandomInt(6);
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
}
