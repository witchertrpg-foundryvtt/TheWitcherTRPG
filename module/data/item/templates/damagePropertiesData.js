import itemEffect from "./itemEffectData.js";

const fields = foundry.data.fields;

export default function damageProperties() {
    return {
        armorPiercing: new fields.BooleanField({ initial: false }),
        improvedArmorPiercing: new fields.BooleanField({ initial: false }),
        ablating: new fields.BooleanField({ initial: false }),
        crushingForce: new fields.BooleanField({ initial: false }),
        damageIsAblation: new fields.BooleanField({ initial: false }),

        damageToAllLocations: new fields.BooleanField({ initial: false }),

        bypassesWornArmor: new fields.BooleanField({ initial: false }),
        bypassesNaturalArmor: new fields.BooleanField({ initial: false }),

        hitGlobalModifiers: new fields.ArrayField(new fields.StringField({ initial: '' })),
        appliesGlobalModifierToHit: new fields.BooleanField({ initial: false }),
        appliesGlobalModifierToDamaged: new fields.BooleanField({ initial: false }),
        damagedGlobalModifiers: new fields.ArrayField(new fields.StringField({ initial: '' })),

        defenseDifferenceMultiplier: new fields.BooleanField({ initial: false }),
        defenseMultiplierCap: new fields.NumberField({ initial: 5 }),

        variableDamage: new fields.BooleanField({ initial: false }),

        effects: new fields.ArrayField(new fields.SchemaField(itemEffect()))
    };
}