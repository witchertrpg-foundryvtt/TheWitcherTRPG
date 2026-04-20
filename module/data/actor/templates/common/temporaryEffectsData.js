const fields = foundry.data.fields;

export default class TemporaryEffects extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            temporaryHp: new fields.TypedObjectField(
                new fields.SchemaField({
                    name: new fields.StringField(),
                    value: new fields.NumberField({ initial: 0 })
                })
            )
        };
    }
}
