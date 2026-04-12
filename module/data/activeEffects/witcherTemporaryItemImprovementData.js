const fields = foundry.data.fields;

export default class WitcherTemporaryItemImprovementData extends foundry.data.ActiveEffectTypeDataModel {
    static metadata = Object.freeze({
        type: 'temporaryItemImprovement'
    });

    static defineSchema() {
        return {
            ...super.defineSchema(),
            applySelf: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applySelf'
            }),
            applyOnTarget: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applyOnTarget'
            }),
            isTransferred: new fields.BooleanField({ initial: false })
        };
    }
}
