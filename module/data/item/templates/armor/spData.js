const fields = foundry.data.fields;

export default class SpData extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            stoppingPower: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.StoppingPower'
            }),
            modifiedStoppingPower: new fields.NumberField({
                initial: 0
            }),
            maxStoppingPower: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.MaxStoppingPower'
            }),
            modifiedMaxStoppingPower: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.MaxStoppingPower'
            })
        };
    }

    prepareBaseData() {
        this.modifiedStoppingPower = this.stoppingPower;
        this.modifiedMaxStoppingPower = this.maxStoppingPower;
    }

    prepareDerivedData() {
        if (this.maxStoppingPower == 0) return;

        let enhancements = this.parent.enhancementItems;

        enhancements?.forEach(enhancement => {
            this.modifiedStoppingPower += enhancement.system.stopping;
            this.modifiedMaxStoppingPower += enhancement.system.stopping;
        });
    }
}
