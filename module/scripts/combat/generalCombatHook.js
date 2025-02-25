export async function applyGeneralCombatHooks(combat) {
    if (!game.user.isGM) return;

    let actor = combat.combatants.get(combat.current.combatantId).actor;
    applyMonsterRegeneration(actor);
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
