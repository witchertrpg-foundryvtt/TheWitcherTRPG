import modifier from '../modifierData.js';

const fields = foundry.data.fields;

export default function stat(label) {
    return {
        max: new fields.NumberField({ initial: 0}),
        current: new fields.NumberField({ initial: 0}),
        total: new fields.NumberField({ initial: 0}),
        label: new fields.StringField({ initial: label}),
        isOpened: new fields.BooleanField({ initial: false}),
        modifiers: new fields.ArrayField(new fields.SchemaField(modifier())),
        totalModifiers: new fields.NumberField({ initial: 0 }),
    };
  }