const fields = foundry.data.fields;

export default class WitcherTemporaryItemImprovementData extends foundry.abstract.TypeDataModel {
    static metadata = Object.freeze({
        type: 'temporaryItemImprovement'
    });

    static defineSchema() {
        return {
            isTransferred: new fields.BooleanField({ initial: false })
        };
    }
}
