const fields = foundry.data.fields;

export default class CommonItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new fields.StringField({ initial: '' }),
      quantity: new fields.StringField({ initial: '1' }),
      weight: new fields.NumberField({ initial: 0 }),
      cost: new fields.NumberField({ initial: 0 }),
      sourcebook: new fields.StringField({ initial: '' }),

      isHidden: new fields.BooleanField({ initial: false }),
      isStored: new fields.BooleanField({ initial: false }),
      isCarried: new fields.BooleanField({ initial: true }),
    }
  }
}