const fields = foundry.data.fields;

export default class DefenseProperties extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            parrying: new fields.BooleanField({ initial: false, label: 'WITCHER.Item.DefenseProperties.parrying' }),
            defendsAgainst: new fields.SetField(new fields.StringField({ required: true, blank: false }), {
                label: 'WITCHER.Item.DefenseProperties.defendsAgainst.label',
                hint: 'WITCHER.Item.DefenseProperties.defendsAgainst.hint'
            }),
            modifier: new fields.NumberField({ initial: 0, label: 'WITCHER.Item.DefenseProperties.modifier' })
        };
    }

    isApplicableDefense(attack) {
        return this.defendsAgainst.has(attack);
    }

    createDefenseOption() {
        return {
            modifier: this.modifier,
            skills: [],
            itemTypes: []
        };
    }
}
