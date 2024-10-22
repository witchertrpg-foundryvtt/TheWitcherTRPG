export function addChatListeners(html) {
    html.on('click', "button.shield", onShield)
    html.on('click', "button.heal", onHeal)
}

function onShield(event) {
    let shield = event.currentTarget.getAttribute("data-shield")
    let actorUuid = event.currentTarget.getAttribute("data-actor")

    let actor = fromUuidSync(actorUuid);
    actor?.update({ 'system.derivedStats.shield.value': shield });

    let messageContent = `${actor.name} ${game.i18n.localize("WITCHER.Combat.shieldApplied")} ${shield}`;
    let messageData = {
        user: game.user.id,
        content: messageContent,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
    }
    ChatMessage.create(messageData);
}

function onHeal(event) {
    let heal = parseInt(event.currentTarget.getAttribute("data-heal"))
    let actorUuid = event.currentTarget.getAttribute("data-actor")

    let actor = fromUuidSync(actorUuid);

    let target = game.user.targets[0]?.actor ?? canvas.tokens.controlled[0]?.actor ?? game.user.character
    if (!target) return;

    heal = (target?.system.derivedStats.hp.value + heal) > target?.system.derivedStats.hp.max ? (target?.system.derivedStats.hp.max - target?.system.derivedStats.hp.value) : heal;
    target?.update({ 'system.derivedStats.hp.value': target.system.derivedStats.hp.value + heal });

    let messageContent = `${actor.name} ${game.i18n.format("WITCHER.Combat.healed", { heal: heal, target: target.name })}`;
    let messageData = {
        user: game.user.id,
        content: messageContent,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
    }
    ChatMessage.create(messageData);
}

