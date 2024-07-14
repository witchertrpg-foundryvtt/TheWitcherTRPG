import CommonItemData from "./commonItemData.js";
import craftingComponent from "./templates/craftingComponentData.js";

const fields = foundry.data.fields;

export default class DiagramData extends CommonItemData {

    static defineSchema() {
  
      const commonData = super.defineSchema();
      return {
        // Using destructuring to effectively append our additional data here
        ...commonData,
        type: new fields.StringField({initial: ''}),
        level: new fields.StringField({initial: ''}),
        isFormulae: new fields.BooleanField({initial: false}),
        craftingDC: new fields.NumberField({initial: 0}),
        alchemyDC: new fields.NumberField({initial: 0}),
        craftingTime: new fields.StringField({initial: ''}),
        investment: new fields.NumberField({initial: 0}),
        learned: new fields.BooleanField({initial: false}),

        craftingComponents: new fields.ArrayField(new fields.SchemaField(craftingComponent())),
        alchemyComponents: new fields.SchemaField({
          vitriol: new fields.NumberField({initial: 0}),
          rebis: new fields.NumberField({initial: 0}),
          aether: new fields.NumberField({initial: 0}),
          quebrith: new fields.NumberField({initial: 0}),
          hydragenum: new fields.NumberField({initial: 0}),
          vermilion: new fields.NumberField({initial: 0}),
          sol: new fields.NumberField({initial: 0}),
          caelum: new fields.NumberField({initial: 0}),
          fulgur: new fields.NumberField({initial: 0}),
        }),

        associatedItemUuid: new fields.StringField({initial: ''}),
      }
    }

    prepareDerivedData() {
      super.prepareDerivedData();
  
      let itemUuid = this.associatedItemUuid;
      if(itemUuid) {
          this.associatedItem = fromUuidSync(itemUuid);
      }
    }

     /** @inheritdoc */
     static migrateData(source) {
      super.migrateData(source);

      if ("associatedItem" in source) {
        source.associatedItemUuid = "Compendium.TheWitcherTRPG.gear.Item." + source.associatedItem._id;
      }
    }
  }