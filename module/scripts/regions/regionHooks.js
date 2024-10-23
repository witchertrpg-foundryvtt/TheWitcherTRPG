export async function countdownDurationOfRegions(combat, update, options, userId) {
    if (!game.user.isGM) return;

    let actorUuid = combat.combatants.get(combat.current.combatantId).actor.uuid;

    let toDelete = [];
    game.scenes.active.regions
        .filter(region => region.flags.TheWitcherTRPG.actorUuid === actorUuid)
        .forEach(region => {
            if (region.flags.TheWitcherTRPG.duration - 1 > 0) {
                region.setFlag('TheWitcherTRPG', 'duration', region.flags.TheWitcherTRPG.duration - 1);
            } else {
                toDelete.push(region.id);
            }
        });

    game.scenes.active.deleteEmbeddedDocuments('Region', toDelete);
}
