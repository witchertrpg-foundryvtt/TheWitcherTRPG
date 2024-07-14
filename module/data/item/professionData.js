import CommonItemData from "./commonItemData.js";
import professionPath from "./templates/professionPathData.js";
import professionSkill from "./templates/professionSkillData.js";

const fields = foundry.data.fields;

export default class ProfessionData extends CommonItemData {

    static defineSchema() {
  
      const commonData = super.defineSchema();
      return {
        // Using destructuring to effectively append our additional data here
        ...commonData,
        notes: new fields.StringField({initial: ''}),
        definingSkill: new fields.SchemaField(professionSkill()),
        skillPath1: new fields.SchemaField(professionPath()),
        skillPath2: new fields.SchemaField(professionPath()),
        skillPath3: new fields.SchemaField(professionPath()),
      }
    }
  }