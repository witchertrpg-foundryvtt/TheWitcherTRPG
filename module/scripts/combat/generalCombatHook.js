import { applyDamageFromStatus } from '../combat/applyDamage.js';

export async function applyGeneralCombatHooks(combat) {
    if (!game.user.isGM) return;

    let actor = combat.combatants.get(combat.current.combatantId).actor;
    applyMonsterRegeneration(actor);
    applyCombatEffects(actor);
}

async function applyMonsterRegeneration(actor) {
    if (actor.type != 'monster') return;
    if (actor.system.regeneration === 0) return;
    if (actor.statuses.has('dead')) return;

    const content = await renderTemplate('systems/TheWitcherTRPG/templates/chat/combat/regeneration.hbs', {
        actor: actor
    });

    const chatData = {
        content: content,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flags: actor.getDamageFlags(),
        type: CONST.CHAT_MESSAGE_STYLES.OTHER,
        whisper: [game.user.id]
    };

    ChatMessage.create(chatData);

    actor.update({
        'system.derivedStats.hp.value': Math.min(
            actor.system.derivedStats.hp.value + actor.system.regeneration,
            actor.system.derivedStats.hp.max
        )
    });
}

async function applyCombatEffects(actor) {
    for (const status of Object.values(actor.system.combatEffects.turnStartEffects)) {
        await applyCombatEffect(actor, status);
    }
}

async function applyCombatEffect(actor, status) {
    if (!status.heal?.amount && !status.damage?.amount) return;
    const content = await renderTemplate('systems/TheWitcherTRPG/templates/chat/combat/statusEffect.hbs', status);
    const chatData = {
        content: content,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flags: actor.getDamageFlags(),
        type: CONST.CHAT_MESSAGE_STYLES.OTHER
    };

    ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));
    ChatMessage.create(chatData);

    if (status.damage && status.damage.amount > 0) {
        let damage = {
            properties: {
                spDamage: status.damage.spDamage,
                damageToAllLocations: status.damage.allLocations,
                effects: [],
                bypassesNaturalArmor: status.damage.ignoreArmor,
                bypassesWornArmor: status.damage.ignoreArmor
            },
            location: actor.getLocationObject('torso')
        };
        if (status.damage.nonLethal) {
            await applyDamageFromStatus(actor, status.damage.amount + (status.damage.modifier ?? 0), damage, 'sta');
        } else {
            await applyDamageFromStatus(actor, status.damage.amount + (status.damage.modifier ?? 0), damage, 'hp');
        }
    }

    if (status.heal && status.heal.amount > 0) {
        let healedFor = await actor.calculateHealValue(status.heal.amount);
        if (healedFor > 0) {
            await actor.update({ 'system.derivedStats.hp.value': actor.system.derivedStats.hp.value + healedFor });
            await actor.createHealMessage(healedFor);
        }
    }
}
