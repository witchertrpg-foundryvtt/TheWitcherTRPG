export let damageUtilMixin = {
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
    },

    getDamageFlags() {
        return {
            origin: {
                name: this.name,
                uuid: this.uuid
            },
            damage: true
        };
    },

    getNoDamageFlags() {
        return {
            origin: {
                name: this.name,
                uuid: this.uuid
            },
            damage: false
        };
    }
};
