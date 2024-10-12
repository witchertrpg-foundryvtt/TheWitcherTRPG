export async function removeExpiredActiveEffects(combat) {
    if (!game.user.isGM) return;

    combat.combatants.forEach(combatant => {
        let expiredEffects = combatant.actor.effects.filter(effect => effect.duration.remaining === 0);

        expiredEffects.forEach(effect => effect.delete());
    });
}
