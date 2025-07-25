import { migrateDamageProperties } from '../migrations/damagePropertiesMigration.js';
import CommonItemData from './commonItemData.js';
import damageProperties from './templates/combat/damagePropertiesData.js';
import weaponType from './templates/weaponTypeData.js';
import { associatedDiagramUuid, unwrapAssociatedDiagram } from './templates/associatedDiagramData.js';
import defenseOptions from './templates/combat/defenseOptionsData.js';
import attackOptions from './templates/combat/attackOptionsData.js';
import DefenseProperties from './templates/combat/defensePropertiesData.js';

const fields = foundry.data.fields;

export default class WeaponData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();
        return {
            // Using destructuring to effectively append our additional data here
            ...commonData,
            type: new fields.SchemaField(weaponType()),
            isAmmo: new fields.BooleanField({ initial: false }),

            conceal: new fields.StringField({ initial: '' }),
            avail: new fields.StringField({ initial: '' }),
            hands: new fields.StringField({ initial: 'none' }),
            equipped: new fields.BooleanField({ initial: false }),

            reliable: new fields.NumberField({ initial: 0 }),
            maxReliability: new fields.NumberField({ initial: 0 }),

            damage: new fields.StringField({ initial: '' }),
            range: new fields.StringField({ initial: '' }),
            accuracy: new fields.NumberField({ initial: 0 }),
            rateOfFire: new fields.NumberField({ initial: 1 }),
            usingAmmo: new fields.BooleanField({ initial: false }),
            rollOnlyDmg: new fields.BooleanField({ initial: false }),

            enhancements: new fields.NumberField({ initial: 0 }),
            enhancementItemIds: new fields.ArrayField(new fields.StringField({ initial: '' })),

            ...attackOptions(),
            damageProperties: new fields.SchemaField(damageProperties()),
            ...defenseOptions(),
            defenseProperties: new fields.EmbeddedDataField(DefenseProperties),

            ...associatedDiagramUuid()
        };
    }

    isApplicableDefense(attack) {
        return this.defenseProperties.isApplicableDefense(attack);
    }

    createDefenseOption(attack) {
        return {
            ...this.defenseProperties.createDefenseOption(attack),
            skills: [
                this.meleeAttackSkill ?? this.rangedAttackSkill ?? this.spellAttackSkill ?? this.itemUseAttackSkill
            ]
        };
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        let enhancementItemIds = this.enhancementItemIds;
        if (enhancementItemIds?.length > 0) {
            this.enhancementItems = [];

            let items = this.parent.actor.items;

            enhancementItemIds.forEach(itemId => {
                let item = items.get(itemId);
                if (item) {
                    this.enhancementItems.push({
                        name: item.name,
                        img: item.img,
                        system: item.system,
                        id: itemId
                    });
                }
            });
        }

        unwrapAssociatedDiagram(this);
    }

    /** @inheritdoc */
    static migrateData(source) {
        super.migrateData(source);

        if ('enhancementItems' in source) {
            source.enhancementItemIds = source.enhancementItemIds ?? [];
            source.enhancementItems.forEach(enhancement => {
                if (Object.keys(enhancement).length !== 0) {
                    source.enhancementItemIds.push(enhancement._id);
                }
            });
        }

        this.effects?.forEach(effect => (effect.percentage = parseInt(effect.percentage)));

        migrateDamageProperties(source);
    }
}
