import complexity from "./templates/complexityData.js";

const fields = foundry.data.fields;

export default class MysteryActorData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      return {
          goal: new fields.StringField({ initial: ''}),
          complexity: new fields.SchemaField(complexity())
      }
  }
}