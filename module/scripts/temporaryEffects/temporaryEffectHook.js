export async function removeExpiredEffects(combat) {
    if (!game.user.isActiveGM) return;

    combat.combatants.forEach(async combatant => {
        await combatant.actor.handleExpiredEffects();
    });
}
