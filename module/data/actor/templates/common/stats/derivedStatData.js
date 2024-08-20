import modifier from "../modifierData.js";

const fields = foundry.data.fields;

export default function derivedStat(label) {
    return {
        max: new fields.NumberField({ initial: 0}),
        unmodifiedMax: new fields.NumberField({ initial: 0}),
        value: new fields.NumberField({ initial: 0}),
        label: new fields.StringField({ initial: label}),
        modifiers: new fields.ArrayField(new fields.SchemaField(modifier())),
        totalModifiers: new fields.NumberField({ initial: 0 }),
    };
  }