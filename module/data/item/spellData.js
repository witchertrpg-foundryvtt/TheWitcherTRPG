import { migrateDamageProperties } from '../migrations/damagePropertiesMigration.js';
import CommonItemData from './commonItemData.js';
import attackOptions from './templates/combat/attackOptionsData.js';
import damageProperties from './templates/combat/damagePropertiesData.js';
import defenseOptions from './templates/combat/defenseOptionsData.js';
import itemEffect from './templates/itemEffectData.js';
import regionProperties from './templates/regions/regionPropertiesData.js';

const fields = foundry.data.fields;

export default class SpellData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();
        return {
            // Using destructuring to effectively append our additional data here
            ...commonData,
            class: new fields.StringField({ initial: '' }),
            level: new fields.StringField({ initial: '' }),
            source: new fields.StringField({ initial: '' }),
            domain: new fields.StringField({ initial: '' }),
            sideEffect: new fields.StringField({ initial: '' }), //needed for magical gifts

            stamina: new fields.NumberField({ initial: 0 }),
            staminaIsVar: new fields.BooleanField({ initial: false }),

            effect: new fields.StringField({ initial: '' }),
            range: new fields.StringField({ initial: '' }),
            duration: new fields.StringField({ initial: '' }),
            defence: new fields.StringField({ initial: '' }),

            createTemplate: new fields.BooleanField({ initial: false }),
            templateSize: new fields.NumberField({ initial: 0 }),
            templateType: new fields.StringField({ initial: '' }),
            visualEffectDuration: new fields.NumberField(),
            regionProperties: new fields.SchemaField(regionProperties()),

            causeDamages: new fields.BooleanField({ initial: false }),
            damage: new fields.StringField({ nullable: true, initial: null }),
            damageType: new fields.StringField({
                initial: 'elemental',
                nullable: false,
                label: 'WITCHER.DamageType.name'
            }),
            damageProperties: new fields.SchemaField(damageProperties()),

            createsShield: new fields.BooleanField({ initial: false }),
            shield: new fields.StringField({ initial: '' }),

            doesHeal: new fields.BooleanField({ initial: false }),
            heal: new fields.StringField({ initial: '' }),

            selfEffects: new fields.ArrayField(new fields.SchemaField(itemEffect())),
            onCastEffects: new fields.ArrayField(new fields.SchemaField(itemEffect())),

            ...attackOptions(),
            ...defenseOptions()
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        super.migrateData(source);

        if ('dificultyCheck' in source) {
            source.difficultyCheck = source.dificultyCheck;
        }

        this.effects?.forEach(effect => (effect.percentage = parseInt(effect.percentage)));

        this.migrateTemplateSize(source);
        migrateDamageProperties(source);
    }

    static migrateTemplateSize(source) {
        if (typeof source.templateSize === 'string' || source.templateSize instanceof String) {
            source.templateSize = parseInt(source.templateSize) || 0;
        }
    }
}
