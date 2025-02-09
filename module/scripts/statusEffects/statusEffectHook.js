import { applyDamageFromStatus } from '../combat/applyDamage.js';

export async function applyStatusRoundEffects(combat) {
    if (!game.user.isGM) return;

    let actor = combat.combatants.get(combat.current.combatantId).actor;
    let statusEffects = actor.statuses
        .map(status => CONFIG.WITCHER.statusEffects.find(configStatus => configStatus.id == status))
        .filter(status => status.combat);

    for (const status of statusEffects) {
        if (status.combat.turn?.damage) {
            await applyCombatEffects(actor, status);
        }
    }
}

async function applyCombatEffects(actor, status) {
    const content = await renderTemplate('systems/TheWitcherTRPG/templates/chat/damage/statusEffectDamage.hbs', status);
    const chatData = {
        content: content,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flags: actor.getDamageFlags(),
        type: CONST.CHAT_MESSAGE_STYLES.OTHER
    };

    ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));
    ChatMessage.create(chatData);

    let damage = {
        properties: {
            spDamage: status.combat.turn?.damage.spDamage,
            damageToAllLocations: status.combat.turn?.damage.allLocations,
            effects: [],
            bypassesNaturalArmor: status.combat.turn?.damage.ignoreArmor,
            bypassesWornArmor: status.combat.turn?.damage.ignoreArmor,
        },
        location: actor.getLocationObject('torso')
    };
    if (status.combat.turn?.damage.nonLethal) {
        await applyDamageFromStatus(
            actor,
            status.combat.turn?.damage.damage,
            damage,
            'sta'
        );
    } else {
        await applyDamageFromStatus(
            actor,
            status.combat.turn?.damage.damage,
            damage,
            'hp'
        );
    }
}
