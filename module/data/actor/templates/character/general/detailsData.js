import valueLabel from "../../valueLabelData.js";

const fields = foundry.data.fields;

export default function details() {
    return {
        clothing: new fields.SchemaField(valueLabel("WITCHER.Clothing")),
        personality: new fields.SchemaField(valueLabel("WITCHER.Personality")),
        hairStyle: new fields.SchemaField(valueLabel("WITCHER.Hair")),
        affectations: new fields.SchemaField(valueLabel("WITCHER.Affectations")),
        valuedPerson: new fields.SchemaField(valueLabel("WITCHER.ValuedPerson")),
        value: new fields.SchemaField(valueLabel("WITCHER.Value")),
        feelingsOnPeople: new fields.SchemaField(valueLabel("WITCHER.FeelingsOnPeople")),

    }
  }