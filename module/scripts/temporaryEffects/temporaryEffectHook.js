export async function removeExpiredEffects(combat) {
    if (!game.user.isGM) return;

    combat.combatants.forEach(async combatant => {
        await combatant.actor.handleExpiredEffects();
        await combatant.actor.tickdownEffects();
    });
}
