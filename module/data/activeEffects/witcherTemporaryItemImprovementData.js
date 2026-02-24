const fields = foundry.data.fields;

export default class WitcherTemporaryItemImprovementData extends foundry.abstract.TypeDataModel {
    static metadata = Object.freeze({
        type: 'temporaryItemImprovement'
    });

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
            isTransferred: new fields.BooleanField({ initial: false })
        };
    }
}
