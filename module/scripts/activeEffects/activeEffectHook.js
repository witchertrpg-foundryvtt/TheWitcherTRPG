export async function removeExpiredActiveEffects(combat) {
    if (!game.user.isGM) return;

    combat.combatants.forEach(combatant => {
        combatant.actor.handleExpiredEffects();
    });
}
