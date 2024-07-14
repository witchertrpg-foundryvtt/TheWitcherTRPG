import CommonItemData from "./commonItemData.js";
import effectDerivedStat from "./templates/effectDerivedStatData.js";
import effectSkill from "./templates/effectSkillData.js";
import effectStat from "./templates/effectStatData.js";


const fields = foundry.data.fields;

export default class EffectData extends CommonItemData {

    static defineSchema() {
  
      const commonData = super.defineSchema();
      return {
        // Using destructuring to effectively append our additional data here
        ...commonData,
        description: new fields.StringField({ initial: ""}),
        isActive: new fields.BooleanField({ initial: false}),
        isHud: new fields.BooleanField({ initial: false}),

        stats: new fields.ArrayField(new fields.SchemaField(effectStat())),
        derived: new fields.ArrayField(new fields.SchemaField(effectDerivedStat())),
        skills: new fields.ArrayField(new fields.SchemaField(effectSkill())),
      }
    }
  }