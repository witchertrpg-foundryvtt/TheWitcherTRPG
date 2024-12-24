export let damageUtilMixin = {
    createBaseDamageObject() {
        return {
            damageProperties: foundry.utils.deepClone(this.system.damageProperties),
            item: this,
            itemUuid: this.uuid,
            crit: {
                critLocationModifier: this.parent.system.attackStats.critLocationModifier,
                critEffectModifier: this.parent.system.attackStats.critEffectModifier
            }
        };
    }
};
