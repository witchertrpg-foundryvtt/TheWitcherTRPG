import CommonItemData from './commonItemData.js';
import component from './templates/componentData.js';
import regionProperties from './templates/regions/regionPropertiesData.js';

const fields = foundry.data.fields;

export default class RitualData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();
        return {
            // Using destructuring to effectively append our additional data here
            ...commonData,
            level: new fields.StringField({ initial: '' }),

            stamina: new fields.NumberField({ initial: 0 }),
            staminaIsVar: new fields.BooleanField({ initial: false }),

            effect: new fields.StringField({ initial: '' }),
            range: new fields.StringField({ initial: '' }),
            duration: new fields.StringField({ initial: '' }),
            defence: new fields.StringField({ initial: '' }),

            components: new fields.StringField({ initial: '' }),
            ritualComponentUuids: new fields.ArrayField(new fields.SchemaField(component())),
            alternateRitualComponentUuids: new fields.ArrayField(new fields.SchemaField(component())),
            preparationTime: new fields.StringField({ initial: '' }),
            difficultyCheck: new fields.StringField({ initial: '' }),

            createTemplate: new fields.BooleanField({ initial: false }),
            templateSize: new fields.NumberField({ initial: 0 }),
            templateType: new fields.StringField({ initial: '' }),
            visualEffectDuration: new fields.NumberField(),
            regionProperties: new fields.SchemaField(regionProperties())
        };
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        this.ritualComponents = [];
        this.alternateRitualComponents = [];
        this.ritualComponentUuids?.forEach(component =>
            this.ritualComponents.push({
                item: fromUuidSync(component.uuid) ?? { name: component.uuid },
                quantity: component.quantity
            })
        );

        this.alternateRitualComponentUuids?.forEach(component =>
            this.alternateRitualComponents.push({
                item: fromUuidSync(component.uuid) ?? { name: component.uuid },
                quantity: component.quantity
            })
        );
    }

    /** @inheritdoc */
    static migrateData(source) {
        super.migrateData(source);
    }
}
