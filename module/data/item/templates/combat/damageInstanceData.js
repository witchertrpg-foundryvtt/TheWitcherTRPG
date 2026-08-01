const fields = foundry.data.fields;

export default class DamageInstance extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            value: new fields.StringField({ initial: '', label: 'WITCHER.Damage.name' }),
            type: new fields.SetField(new fields.StringField({ required: true, blank: false }), {
                label: 'WITCHER.Damage.damageType'
            })
        };
    }


}
