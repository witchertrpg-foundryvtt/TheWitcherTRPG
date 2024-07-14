import CommonItemData from "./commonItemData.js";
import modifierDerivedStat from "./templates/effectDerivedStatData.js";
import modifierSkill from "./templates/effectSkillData.js";
import modifierStat from "./templates/effectStatData.js";


const fields = foundry.data.fields;

export default class GlobalModifierData extends CommonItemData {

  static defineSchema() {

    const commonData = super.defineSchema();
    return {
      // Using destructuring to effectively append our additional data here
      ...commonData,
      description: new fields.StringField({ initial: "" }),
      isActive: new fields.BooleanField({ initial: false }),

      stats: new fields.ArrayField(new fields.SchemaField(modifierStat())),
      derived: new fields.ArrayField(new fields.SchemaField(modifierDerivedStat())),
      skills: new fields.ArrayField(new fields.SchemaField(modifierSkill())),
    }
  }
}