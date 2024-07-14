const fields = foundry.data.fields;

export default class ClueData extends foundry.abstract.TypeDataModel{

    static defineSchema() {
      return {
        isHidden: new fields.BooleanField({initial: false}),

        type: new fields.StringField({ initial: ''}),
        dc: new fields.NumberField({initial: 14}),
        skillsUsed: new fields.ArrayField(new fields.StringField({ initial: ''})),
        timeIncrement: new fields.StringField({ initial: ''}),
        timeBonus: new fields.NumberField({ initial: 0}),

        damage: new fields.StringField({ initial: ''}),
        obfuscation: new fields.NumberField({ initial: 0}),

        penalty: new fields.StringField({ initial: ''}),
        focusDamage: new fields.StringField({ initial: '1d6'}),
      }
    }
  }