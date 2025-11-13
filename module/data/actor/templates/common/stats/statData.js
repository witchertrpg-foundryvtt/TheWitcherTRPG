import modifier from '../modifierData.js';

const fields = foundry.data.fields;

export default function stat(label, unmodifiedMax = 0) {
    return {
        max: new fields.NumberField({ initial: 0, integer: true }),
        unmodifiedMax: new fields.NumberField({ initial: unmodifiedMax, integer: true, label }),
        value: new fields.NumberField({ initial: 0 }),
        label: new fields.StringField({ initial: label }),
        modifiers: new fields.ArrayField(new fields.SchemaField(modifier())),
        totalModifiers: new fields.NumberField({ initial: 0, integer: true }),
        isOpened: new fields.BooleanField({ initial: false })
    };
}
