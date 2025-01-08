const fields = foundry.data.fields;

export default class WitcherActiveEffectData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            applySelf: new fields.BooleanField({ initial: false }),
            applyOnTarget: new fields.BooleanField({ initial: false }),
            applyOnHit: new fields.BooleanField({ initial: false }),
            applyOnDamage: new fields.BooleanField({ initial: false })
        };
    }
}
