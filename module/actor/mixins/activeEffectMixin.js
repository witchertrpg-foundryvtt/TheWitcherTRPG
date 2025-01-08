export let activeEffectMixin = {
    async handleExpiredEffects() {
        let expiredEffects = this.effects.filter(effect => effect.duration.remaining === 0);

        let itemEffects = this.items
            .map(item => item.effects.contents)
            .flat()
            .filter(effect => effect.system.isTransferred && effect.duration.remaining === 0);

        itemEffects.forEach(effect => effect.delete());
        expiredEffects.forEach(effect => effect.delete());
    }
};
