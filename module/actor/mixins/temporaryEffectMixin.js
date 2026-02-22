export let temporaryEffectMixin = {
    async handleExpiredEffects() {
        let expiredEffects = this.effects.filter(effect => effect.duration.remaining === 0);

        let itemEffects = this.items
            .map(item => item.effects.contents)
            .flat()
            .filter(effect => effect.system.isTransferred && effect.duration.remaining === 0);

        itemEffects.forEach(effect => effect.delete());
        expiredEffects.forEach(effect => effect.delete());

        let tempHp = this.system.combatEffects.temporaryEffects.temporaryHp.filter(
            temp => temp.duration > 0 && temp.value > 0
        );
        await this.update({
            'system.combatEffects.temporaryEffects.temporaryHp': tempHp
        });
    },

    async tickdownEffects() {
        let tempHp = this.system.combatEffects.temporaryEffects.temporaryHp;
        tempHp.forEach(temp => (temp.duration = temp.duration - 1));
        await this.update({
            'system.combatEffects.temporaryEffects.temporaryHp': tempHp
        });
    }
};
