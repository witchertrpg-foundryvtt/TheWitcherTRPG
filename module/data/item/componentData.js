import CommonItemData from "./commonItemData.js";

const fields = foundry.data.fields;

export default class ComponentData extends CommonItemData {

    static defineSchema() {
  
      const commonData = super.defineSchema();
      return {
        // Using destructuring to effectively append our additional data here
        ...commonData,
        type: new fields.StringField({initial: ''}),
        rarity: new fields.StringField({initial: ''}),
        location: new fields.StringField({initial: ''}),
        quantityObtainable: new fields.StringField({initial: ''}),
        forage: new fields.StringField({initial: ''}),
        substanceType: new fields.StringField({initial: ''}),
      }
    }
  }