import itemEffect from "./itemEffectData.js";

const fields = foundry.data.fields;

export default function consumeProperties() {
    return {
        doesHeal: new fields.BooleanField({ initial: false }),
        heal: new fields.StringField({ initial: '' }),

        appliesGlobalModifier: new fields.BooleanField({ initial: false }),
        consumeGlobalModifiers: new fields.ArrayField(new fields.StringField({ initial: '' })),

        effects: new fields.ArrayField(new fields.SchemaField(itemEffect())),
    };
}