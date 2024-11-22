export let baseDamageMixin = {
    createBaseDamageObject(item) {
        return {
            damageProperties: item.system.damageProperties,
            item: item,
            itemUuid: item.uuid,
            crit: {
                critLocationModifier: item.parent.system.attackStats.critLocationModifier,
                critEffectModifier: item.parent.system.attackStats.critEffectModifier
            }
        };
    }
};
