import CommonItemData from "./commonItemData.js";

const fields = foundry.data.fields;

export default class MutagenData extends CommonItemData {

    static defineSchema() {
  
      const commonData = super.defineSchema();
      return {
        // Using destructuring to effectively append our additional data here
        ...commonData,
        type: new fields.StringField({ initial: ""}),
        source: new fields.StringField({ initial: ""}),
        effect: new fields.StringField({ initial: ""}),

        alchemyDC: new fields.NumberField({ initial: 0}),
        minorMutation: new fields.StringField({ initial: ""}),
      }
    }
  }