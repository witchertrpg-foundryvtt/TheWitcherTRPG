import RepairSystem from '../../item/systems/repair.js';

export let repairMixin = {
    async repair() {
        await RepairSystem.process(this.actor, this);
    },

    restoreReliability() {
        RepairSystem.restoreReliability(this);
    },

    get canBeRepaired() {
        return RepairSystem.canBeRepaired(this);
    }
};
