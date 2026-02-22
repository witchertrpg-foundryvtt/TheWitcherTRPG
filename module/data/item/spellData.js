import { migrateDamageProperties } from '../migrations/damagePropertiesMigration.js';
import CommonItemData from './commonItemData.js';
import { spellVisualMixin } from './mixin/spellVisualMixin.js';
import attackOptions from './templates/combat/attackOptionsData.js';
import damageProperties from './templates/combat/damagePropertiesData.js';
import defenseOptions from './templates/combat/defenseOptionsData.js';
import DefenseProperties from './templates/combat/defensePropertiesData.js';
import itemEffect from './templates/itemEffectData.js';

import RegionProperties from './templates/regions/regionPropertiesData.js';

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
            regionProperties: new fields.EmbeddedDataField(RegionProperties),

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
            ...defenseOptions(),
            defenseProperties: new fields.EmbeddedDataField(DefenseProperties)
        };
    }

    getUsedSkill() {
        return (
            CONFIG.WITCHER.skillMap[this.spellAttackSkill] ??
            CONFIG.WITCHER.magic[this.parent.type]?.skill ??
            CONFIG.WITCHER.magic[this.class].skill
        );
    }

    isApplicableDefense(attack) {
        return this.defenseProperties.isApplicableDefense(attack);
    }

    createDefenseOption(attack) {
        return {
            ...this.defenseProperties.createDefenseOption(attack),
            skills: [this.getUsedSkill().name]
        };
    }

    get canHaveTemporaryItemImprovement() {
        return true;
    }

    /** @inheritdoc */
    static migrateData(source) {
        if ('dificultyCheck' in source) {
            source.difficultyCheck = source.dificultyCheck;
        }

        this.effects?.forEach(effect => (effect.percentage = parseInt(effect.percentage)));

        this.migrateTemplateSize(source);
        migrateDamageProperties(source);

        return super.migrateData(source);
    }

    static migrateTemplateSize(source) {
        if (typeof source.templateSize === 'string' || source.templateSize instanceof String) {
            source.templateSize = parseInt(source.templateSize) || 0;
        }
    }
}

Object.assign(SpellData.prototype, spellVisualMixin);
