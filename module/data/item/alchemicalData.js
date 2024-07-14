import CommonItemData from "./commonItemData.js";
import consumeProperties from "./templates/consumePropertiesData.js";

const fields = foundry.data.fields;

export default class AlchemicalData extends CommonItemData {

  static defineSchema() {

    const commonData = super.defineSchema();
    return {
      // Using destructuring to effectively append our additional data here
      ...commonData,
      type: new fields.StringField({ initial: '' }),
      avail: new fields.StringField({ initial: '' }),

      isConsumable: new fields.BooleanField({ initial: false }),
      consumeProperties: new fields.SchemaField(consumeProperties()),

      effect: new fields.StringField({ initial: '' }),
      time: new fields.StringField({ initial: '' }),
      toxicity: new fields.StringField({ initial: '' }),
    }
  }
}