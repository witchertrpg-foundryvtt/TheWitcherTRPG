const fields = foundry.data.fields;

export default class ObstacleData extends foundry.abstract.TypeDataModel{

    static defineSchema() {
      return {
        isHidden: new fields.BooleanField({initial: false}),

        type: new fields.StringField({ initial: ''}),
        dc: new fields.NumberField({initial: 14}),
        skillsUsed: new fields.ArrayField(new fields.StringField({ initial: ''})),

        successDamage: new fields.StringField({ initial: '2'}),
        failDamage: new fields.StringField({ initial: '1d6+2'}),
      }
    }
  }