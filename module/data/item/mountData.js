import CommonItemData from "./commonItemData.js";

const fields = foundry.data.fields;

export default class MountData extends CommonItemData {

    static defineSchema() {
  
      const commonData = super.defineSchema();
      return {
        // Using destructuring to effectively append our additional data here
        ...commonData,
        dex: new fields.StringField({initial: ''}),
        control: new fields.StringField({initial: ''}),
        speed: new fields.StringField({initial: ''}),
        hp: new fields.NumberField({initial: 0})
      }
    }
  }