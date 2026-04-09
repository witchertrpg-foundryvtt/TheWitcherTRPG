const fields = foundry.data.fields;

export default class Threshold extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            hasThresholds: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.profession.skillPath.skill.thresholds.hasThresholds'
            }),
            thresholds: new fields.TypedObjectField(
                new fields.SchemaField({
                    name: new fields.StringField(),
                    value: new fields.NumberField({ initial: 0 })
                })
            )
        };
    }
}
