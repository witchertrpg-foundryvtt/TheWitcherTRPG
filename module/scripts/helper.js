export function getCurrentCharacter() {
    return canvas.tokens.controlled[0]?.actor ?? game.user.character;
}

export function getCurrentToken() {
    return canvas.tokens.controlled[0] ?? game.user.character.token;
}

export async function getInteractActor() {
    let actor = getCurrentCharacter();
    if (!actor) {
        actor = await chooseFromAvailableActors();
    }

    if (!actor) {
        ui.notifications.error(game.i18n.localize('WITCHER.Context.SelectActor'));
        return null;
    }

    return actor;
}

/**
 * This method tries to get an owned actor of the user.
 * If none are found it will return null
 * If exactly one is found, it will automatically return the found actor
 * If several are found it prompts the user to choose on of the available actors
 * @returns an actor
 */
export async function chooseFromAvailableActors() {
    let availableActors = game.actors?.filter(e => e.isOwner && e.hasPlayerOwner) ?? [];

    if (availableActors.length == 0) {
        return;
    }

    if (availableActors.length == 1) {
        return availableActors[0];
    } else {
        let allActors = '';
        game.actors
            ?.filter(e => e.isOwner && e.hasPlayerOwner)
            .forEach(t => {
                allActors = allActors.concat(`
                            <option value="${t.id}">${t.name}</option>`);
            });
        const dialog_content = `
                <select name ="actor">
                ${allActors}
                </select>`;

        let choosenActor = await Dialog.prompt({
            content: dialog_content,
            callback: html => html.find('select').val()
        });

        return game.actors?.get(choosenActor);
    }
}

export function getRandomInt(max) {
    return Math.floor(Math.random() * max) + 1;
}
