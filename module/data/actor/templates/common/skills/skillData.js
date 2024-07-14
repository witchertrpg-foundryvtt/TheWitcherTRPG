import modifier from "../modifierData.js";

const fields = foundry.data.fields;

export default function skill(label) {
    return {
        value: new fields.NumberField({ initial: 0}),
        label: new fields.StringField({ initial: label}),
        isOpened: new fields.BooleanField({ initial: false}),
        isVisible: new fields.BooleanField({ initial: false}),
        modifiers: new fields.ArrayField(new fields.SchemaField(modifier())),
        isProfession: new fields.BooleanField({ initial: false}),
        isPickup: new fields.BooleanField({ initial: false}),
        isLearned: new fields.BooleanField({ initial: false}),
    };
  }