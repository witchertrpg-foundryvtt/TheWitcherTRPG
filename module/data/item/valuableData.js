import CommonItemData from "./commonItemData.js";
import consumable from "./templates/consumableData.js";
import consumeProperties from "./templates/consumePropertiesData.js";

const fields = foundry.data.fields;

export default class ValuableData extends CommonItemData {

  static defineSchema() {

    const commonData = super.defineSchema();
    return {
      // Using destructuring to effectively append our additional data here
      ...commonData,
      type: new fields.StringField({ initial: '' }),
      avail: new fields.StringField({ initial: '' }),
      effect: new fields.StringField({ initial: '' }),
      conceal: new fields.StringField({ initial: '' }),
      quality: new fields.StringField({ initial: '' }),

      ...consumable()
    }
  }
}