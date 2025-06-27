export let defenseOptionMixin = {
    createDefenseOption(attack) {
        return {
            label: this.name,
            value: this.name,
            ...this.system.createDefenseOption?.(attack.attackOption)
        };
    }
};
