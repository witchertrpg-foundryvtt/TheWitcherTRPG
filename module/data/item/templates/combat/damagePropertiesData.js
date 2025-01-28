import itemEffect from '../itemEffectData.js';

const fields = foundry.data.fields;

export default function damageProperties() {
    return {
        armorPiercing: new fields.BooleanField({ initial: false, label: 'WITCHER.Weapon.armorPiercing' }),
        improvedArmorPiercing: new fields.BooleanField({
            initial: false,
            label: 'WITCHER.Weapon.improvedArmorPiercing'
        }),
        ablating: new fields.BooleanField({ initial: false, label: 'WITCHER.Weapon.ablating' }),
        crushingForce: new fields.BooleanField({ initial: false, label: 'WITCHER.Weapon.crushingForce' }),
        damageIsAblation: new fields.BooleanField({
            initial: false,
            label: 'WITCHER.Item.DamageProperties.damageIsAblation'
        }),

        damageToAllLocations: new fields.BooleanField({
            initial: false,
            label: 'WITCHER.Item.DamageProperties.damageToAllLocations'
        }),

        bypassesWornArmor: new fields.BooleanField({
            initial: false,
            label: 'WITCHER.Item.DamageProperties.bypassesWornArmor'
        }),
        bypassesNaturalArmor: new fields.BooleanField({
            initial: false,
            label: 'WITCHER.Item.DamageProperties.bypassesNaturalArmor'
        }),

        hitGlobalModifiers: new fields.ArrayField(new fields.StringField({ initial: '' })),
        appliesGlobalModifierToHit: new fields.BooleanField({ initial: false }),
        appliesGlobalModifierToDamaged: new fields.BooleanField({ initial: false }),
        damagedGlobalModifiers: new fields.ArrayField(new fields.StringField({ initial: '' })),

        defenseDifferenceMultiplier: new fields.BooleanField({
            initial: false,
            label: 'WITCHER.Item.DamageProperties.defenseDifferenceMultiplier'
        }),
        defenseMultiplierCap: new fields.NumberField({
            initial: 5,
            label: 'WITCHER.Item.DamageProperties.defenseMultiplierCap'
        }),

        variableDamage: new fields.BooleanField({
            initial: false,
            label: 'WITCHER.Item.DamageProperties.variableDamage'
        }),

        effects: new fields.ArrayField(new fields.SchemaField(itemEffect())),

        oilEffect: new fields.StringField({ initial: '' }),
        silverDamage: new fields.StringField({ initial: '', label: 'WITCHER.Item.DamageProperties.silverDamage' }),
        isMeteorite: new fields.BooleanField({ initial: false, label: 'WITCHER.Item.DamageProperties.isMeteorite' }),
        isNonLethal: new fields.BooleanField({ initial: false, label: 'WITCHER.Item.DamageProperties.isNonLethal' })
    };
}
