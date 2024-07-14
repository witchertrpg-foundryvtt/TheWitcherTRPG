import CommonItemData from "./commonItemData.js";

const fields = foundry.data.fields;

export default class NoteData extends CommonItemData {

    static defineSchema() {
  
      const commonData = super.defineSchema();
      return {
        // Using destructuring to effectively append our additional data here
        ...commonData,
        description: new fields.StringField({initial: ''}),
      }
    }
  }