import itemEffect from '../itemEffectData.js';

const fields = foundry.data.fields;

export default class DamageProperties extends foundry.abstract.DataModel {
    static defineSchema() {
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
            stun: new fields.NumberField({ label: 'WITCHER.Item.DamageProperties.stun' }),

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

            effects: new fields.TypedObjectField(new fields.SchemaField(itemEffect())),

            oilEffect: new fields.StringField({ initial: '' }),
            silverTrait: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Item.DamageProperties.silverTrait'
            }),
            silverDamage: new fields.StringField({ initial: '', label: 'WITCHER.Item.DamageProperties.silverDamage' }),
            isMeteorite: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Item.DamageProperties.isMeteorite'
            }),
            isNonLethal: new fields.BooleanField({ initial: false, label: 'WITCHER.Item.DamageProperties.isNonLethal' })
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        this.migrateEffectsToTypedField(source);

        return super.migrateData(source);
    }

    static migrateEffectsToTypedField(source) {
        if (Array.isArray(source.effects) && source.effects.length > 0) {
            console.log(source);
            console.log(source.effects);

            source.effects = Object.fromEntries(
                source.effects.map(o => {
                    return [foundry.utils.randomID(), o];
                })
            );
        }
    }
}
