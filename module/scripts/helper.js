export function getCurrentCharacter() {
    return canvas.tokens.controlled[0]?.actor ?? game.user.character
}

export function getCurrentToken() {
    return canvas.tokens.controlled[0] ?? game.user.character.token
}

export function getInteractActor() {
    let actor = getCurrentCharacter()
    if (!actor) {
        ui.notifications.error(game.i18n.localize("WITCHER.Context.SelectActor"));
        return null;
    }

    return actor;
}