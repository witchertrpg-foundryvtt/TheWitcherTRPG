export let damageUtilMixin = {
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
    },

    getFlatDamageMod(damage) {
        return this.system.damageTypeModification[damage.type]?.flat ?? 0;
    },

    getMultiDamageMod(damageObject) {
        let damageMod = this.system.damageTypeModification[damageObject.type];
        if (
            damageMod?.applyAP &&
            (damageObject.damageProperties.armorPiercing || damageObject.damageProperties.improvedArmorPiercing)
        ) {
            return 1;
        }
       return damageMod?.multiplication ?? 1;
    }
};
