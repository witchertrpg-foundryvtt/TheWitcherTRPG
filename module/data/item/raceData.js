import CommonItemData from "./commonItemData.js";
import perk from "./templates/perkData.js";
import socialStanding from "./templates/socialStandingData.js";

const fields = foundry.data.fields;

export default class RaceData extends CommonItemData {

    static defineSchema() {
  
      const commonData = super.defineSchema();
      return {
        // Using destructuring to effectively append our additional data here
        ...commonData,
        description: new fields.StringField({initial: ""}),
        perk1: new fields.SchemaField(perk()),
        perk2: new fields.SchemaField(perk()),
        perk3: new fields.SchemaField(perk()),
        perk4: new fields.SchemaField(perk()),
        socialStanding: new fields.SchemaField(socialStanding()),
      }
    }
  }