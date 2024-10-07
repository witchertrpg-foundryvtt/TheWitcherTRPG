import { migrateDamageProperties } from '../migrations/damagePropertiesMigration.js';
import CommonItemData from './commonItemData.js';
import damageProperties from './templates/damagePropertiesData.js';
import itemEffect from './templates/itemEffectData.js';

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

            stamina: new fields.NumberField({ initial: 0 }),
            staminaIsVar: new fields.BooleanField({ initial: false }),

            effect: new fields.StringField({ initial: '' }),
            range: new fields.StringField({ initial: '' }),
            duration: new fields.StringField({ initial: '' }),
            defence: new fields.StringField({ initial: '' }),

            components: new fields.StringField({ initial: '' }),
            alternateComponents: new fields.StringField({ initial: '' }),
            preparationTime: new fields.StringField({ initial: '' }),
            difficultyCheck: new fields.StringField({ initial: '' }),
            danger: new fields.StringField({ initial: '' }),
            liftRequirement: new fields.StringField({ initial: '' }),
            sideEffect: new fields.StringField({ initial: '' }),

            createTemplate: new fields.BooleanField({ initial: false }),
            templateSize: new fields.StringField({ initial: '' }),
            templateType: new fields.StringField({ initial: '' }),
            visualEffectDuration: new fields.NumberField(),

            causeDamages: new fields.BooleanField({ initial: false }),
            damage: new fields.StringField({ nullable: true, initial: null }),
            damageProperties: new fields.SchemaField(damageProperties()),

            createsShield: new fields.BooleanField({ initial: false }),
            shield: new fields.StringField({ initial: '' }),

            doesHeal: new fields.BooleanField({ initial: false }),
            heal: new fields.StringField({ initial: '' }),

            globalModifiers: new fields.ArrayField(new fields.StringField({ initial: '' })),
            selfEffects: new fields.ArrayField(new fields.SchemaField(itemEffect())),
            onCastEffects: new fields.ArrayField(new fields.SchemaField(itemEffect()))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        super.migrateData(source);

        if ('dificultyCheck' in source) {
            source.difficultyCheck = source.dificultyCheck;
        }

        this.effects?.forEach(effect => (effect.percentage = parseInt(effect.percentage)));

        migrateDamageProperties(source);
    }
}
