const fields = foundry.data.fields;

export default class ActiveEffectData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            applySelf: new fields.BooleanField({ initial: false }),
            applyOnHit: new fields.BooleanField({ initial: false }),
            applyOnDamage: new fields.BooleanField({ initial: false })
        };
    }
}
