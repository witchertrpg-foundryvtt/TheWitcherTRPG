const fields = foundry.data.fields;

export default class WitcherActiveEffectData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            applySelf: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applySelf'
            }),
            applyOnTarget: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applyOnTarget'
            }),
            applyOnHit: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applyOnHit'
            }),
            applyOnDamage: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applyOnDamage'
            })
        };
    }
}
