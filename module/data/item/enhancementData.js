import CommonItemData from "./commonItemData.js";
import itemEffect from "./templates/itemEffectData.js";

const fields = foundry.data.fields;

export default class EnhancementData extends CommonItemData {

  static defineSchema() {

    const commonData = super.defineSchema();
    return {
      // Using destructuring to effectively append our additional data here
      ...commonData,
      type: new fields.StringField({ initial: "" }),
      avail: new fields.StringField({ initial: "" }),
      applied: new fields.BooleanField({ initial: false }),

      stopping: new fields.NumberField({ initial: 0 }),
      bludgeoning: new fields.BooleanField({ initial: false }),
      slashing: new fields.BooleanField({ initial: false }),
      piercing: new fields.BooleanField({ initial: false }),

      effects: new fields.ArrayField(new fields.SchemaField(itemEffect())),
    }
  }

  /** @inheritdoc */
  static migrateData(source) {
    super.migrateData(source);

    this.effects?.forEach(effect => effect.percentage = parseInt(effect.percentage))
  }
}