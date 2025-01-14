const fields = foundry.data.fields;

export default class HomelandData extends foundry.abstract.TypeDataModel {
    static metadata = Object.freeze({
        type: 'homeland'
    });

    static defineSchema() {
        return {
            value: new fields.StringField({ initial: '' }),
            otherValue: new fields.StringField({ initial: '' })
        };
    }
}
