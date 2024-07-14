import CommonItemData from "./commonItemData.js";
import itemEffect from "./templates/itemEffectData.js";

const fields = foundry.data.fields;

export default class ArmorData extends CommonItemData {

  static defineSchema() {

    const commonData = super.defineSchema();
    return {
      // Using destructuring to effectively append our additional data here
      ...commonData,
      type: new fields.StringField({
        initial: 'Light',
        choices: ['Light', 'Medium', 'Heavy', 'Natural',]
      }),
      location: new fields.ArrayField(new fields.StringField({
        initial: 'Torso',
        choices: ['Head', 'Torso', 'Leg', 'FullCover']
      })),

      avail: new fields.StringField({ initial: '' }),
      equipped: new fields.BooleanField({ initial: false }),

      reliability: new fields.NumberField({ initial: 0 }),
      reliabilityMax: new fields.NumberField({ initial: 0 }),
      encumb: new fields.NumberField({ initial: 0 }),
      location: new fields.StringField({ initial: '' }),

      bludgeoning: new fields.BooleanField({ initial: false }),
      slashing: new fields.BooleanField({ initial: false }),
      piercing: new fields.BooleanField({ initial: false }),

      headStopping: new fields.NumberField({ initial: 0 }),
      headMaxStopping: new fields.NumberField({ initial: 0 }),
      torsoStopping: new fields.NumberField({ initial: 0 }),
      torsoMaxStopping: new fields.NumberField({ initial: 0 }),
      leftArmStopping: new fields.NumberField({ initial: 0 }),
      leftArmMaxStopping: new fields.NumberField({ initial: 0 }),
      rightArmStopping: new fields.NumberField({ initial: 0 }),
      rightArmMaxStopping: new fields.NumberField({ initial: 0 }),
      leftLegStopping: new fields.NumberField({ initial: 0 }),
      leftLegMaxStopping: new fields.NumberField({ initial: 0 }),
      rightLegStopping: new fields.NumberField({ initial: 0 }),
      rightLegMaxStopping: new fields.NumberField({ initial: 0 }),


      enhancements: new fields.NumberField({ initial: 0 }),
      enhancementItemIds: new fields.ArrayField(new fields.StringField({ initial: '' })),

      effects: new fields.ArrayField(new fields.SchemaField(itemEffect())),
    }
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    let enhancementItemIds = this.enhancementItemIds;
    if (enhancementItemIds?.length > 0) {
      this.enhancementItems = []

      let items = this.parent.actor.items;

      enhancementItemIds.forEach(itemId => {
        let item = items.get(itemId);
        if (item) {
          this.enhancementItems.push({
            name: item.name,
            img: item.img,
            system: item.system,
            id: itemId,
          })
        }
      });
    }
  }

  /** @inheritdoc */
  static migrateData(source) {
    super.migrateData(source);

    if ("enhancementItems" in source) {
      source.enhancementItemIds = source.enhancementItemIds ?? []
      source.enhancementItems.forEach(enhancement => {
        if (Object.keys(enhancement).length !== 0) {
          source.enhancementItemIds.push(enhancement._id)
        }
      });
    }

    this.effects?.forEach(effect => effect.percentage = parseInt(effect.percentage))
  }
}