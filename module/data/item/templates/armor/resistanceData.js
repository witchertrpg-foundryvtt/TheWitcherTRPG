const fields = foundry.data.fields;

export default class ResistanceData extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            bludgeoning: new fields.BooleanField({ initial: false }),
            slashing: new fields.BooleanField({ initial: false }),
            piercing: new fields.BooleanField({ initial: false })
        };
    }

    prepareBaseData() {}

    prepareDerivedData() {
        let enhancements = this.parent.enhancementItems;

        enhancements?.forEach(enhancement => {
            Object.keys(this).forEach(
                resistance => (this[resistance] = this[resistance] || !!enhancement.system[resistance])
            );
        });
    }
}
