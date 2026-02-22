const fields = foundry.data.fields;

export default class TemporaryEffects extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            temporaryHp: new fields.ArrayField(
                new fields.SchemaField({
                    duration: new fields.NumberField({ initial: 0 }),
                    value: new fields.NumberField({ initial: 0 }),
                    source: new fields.DocumentUUIDField()
                }),
                { initial: [] }
            )
        };
    }
}
