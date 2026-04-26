import CommonItemData from './commonItemData.js';
import itemEffect from './templates/itemEffectData.js';
import { associatedDiagramUuid, unwrapAssociatedDiagram } from './templates/associatedDiagramData.js';
import SpData from './templates/armor/spData.js';
import ResistanceData from './templates/armor/resistanceData.js';

import DefenseProperties from './templates/combat/defensePropertiesData.js';

const fields = foundry.data.fields;

export default class ArmorData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();
        return {
            // Using destructuring to effectively append our additional data here
            ...commonData,
            type: new fields.StringField({
                initial: 'Light',
                choices: ['Light', 'Medium', 'Heavy', 'Natural']
            }),
            location: new fields.ArrayField(
                new fields.StringField({
                    initial: 'Torso',
                    choices: ['Head', 'Torso', 'Leg', 'FullCover']
                })
            ),

            avail: new fields.StringField({ initial: '' }),
            equipped: new fields.BooleanField({ initial: false }),

            reliability: new fields.NumberField({ initial: 0 }),
            reliabilityMax: new fields.NumberField({ initial: 0 }),
            encumb: new fields.NumberField({ initial: 0 }),
            location: new fields.StringField({ initial: '' }),

            resistance: new fields.EmbeddedDataField(ResistanceData),

            bludgeoning: new fields.BooleanField({ initial: false }),
            slashing: new fields.BooleanField({ initial: false }),
            piercing: new fields.BooleanField({ initial: false }),

            head: new fields.EmbeddedDataField(SpData),
            torso: new fields.EmbeddedDataField(SpData),
            leftArm: new fields.EmbeddedDataField(SpData),
            rightArm: new fields.EmbeddedDataField(SpData),
            leftLeg: new fields.EmbeddedDataField(SpData),
            rightLeg: new fields.EmbeddedDataField(SpData),

            headStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.StoppingPower',
                hint: 'WITCHER.Armor.LocationHead'
            }),
            headMaxStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.MaxStoppingPower',
                hint: 'WITCHER.Armor.LocationHead'
            }),
            torsoStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.StoppingPower',
                hint: 'WITCHER.Armor.LocationTorso'
            }),
            torsoMaxStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.MaxStoppingPower',
                hint: 'WITCHER.Armor.LocationTorso'
            }),
            leftArmStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.StoppingPower',
                hint: 'WITCHER.Armor.locationLeftArm'
            }),
            leftArmMaxStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.MaxStoppingPower',
                hint: 'WITCHER.Armor.locationLeftArm'
            }),
            rightArmStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.StoppingPower',
                hint: 'WITCHER.Armor.locationRightArm'
            }),
            rightArmMaxStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.MaxStoppingPower',
                hint: 'WITCHER.Armor.locationRightArm'
            }),
            leftLegStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.StoppingPower',
                hint: 'WITCHER.Armor.locationLeftLeg'
            }),
            leftLegMaxStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.MaxStoppingPower',
                hint: 'WITCHER.Armor.locationLeftLeg'
            }),
            rightLegStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.StoppingPower',
                hint: 'WITCHER.Armor.locationRightLeg'
            }),
            rightLegMaxStopping: new fields.NumberField({
                initial: 0,
                label: 'WITCHER.Armor.MaxStoppingPower',
                hint: 'WITCHER.Armor.locationRightLeg'
            }),

            enhancements: new fields.NumberField({ initial: 0 }),
            enhancementItemIds: new fields.ArrayField(new fields.StringField({ initial: '' })),

            effects: new fields.TypedObjectField(new fields.SchemaField(itemEffect())),

            ...associatedDiagramUuid(),
            defenseProperties: new fields.EmbeddedDataField(DefenseProperties)
        };
    }

    prepareBaseData() {
        super.prepareBaseData();
        this.resistance.prepareBaseData();
        this.head.prepareBaseData();
        this.torso.prepareBaseData();
        this.leftArm.prepareBaseData();
        this.rightArm.prepareBaseData();
        this.leftLeg.prepareBaseData();
        this.rightLeg.prepareBaseData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        let enhancementItemIds = this.enhancementItemIds;
        if (enhancementItemIds?.length > 0) {
            this.enhancementItems = [];

            let items = this.parent.actor.items;

            enhancementItemIds
                .filter(id => id)
                .forEach(itemId => {
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

        this.resistance.prepareDerivedData();

        this.head.prepareDerivedData();
        this.torso.prepareDerivedData();
        this.leftArm.prepareDerivedData();
        this.rightArm.prepareDerivedData();
        this.leftLeg.prepareDerivedData();
        this.rightLeg.prepareDerivedData();

        unwrapAssociatedDiagram(this);
    }

    get effectsWithEnhancements() {
        let effects = { ...this.effects };

        this.enhancementItems
            .filter(item => Object.keys(item).length !== 0)
            .forEach(enhancement => (effects = { ...effects, ...enhancement.system.effects }));

        return effects;
    }

    get enhancementsEffects() {
        let effects = {};

        this.enhancementItems
            .filter(item => Object.keys(item).length !== 0)
            .forEach(enhancement => (effects = { ...effects, ...enhancement.system?.effects }));

        return effects;
    }

    addEffects(effects) {
        this.effects = { ...this.effects, ...effects };
    }

    /** @inheritdoc */
    static migrateData(source) {
        if ('enhancementItems' in source) {
            source.enhancementItemIds = source.enhancementItemIds ?? [];
            source.enhancementItems.forEach(enhancement => {
                if (Object.keys(enhancement).length !== 0) {
                    source.enhancementItemIds.push(enhancement._id);
                }
            });
        }

        this.effects?.forEach(effect => (effect.percentage = parseInt(effect.percentage)));
        this.migrateEffectsToTypedField(source);

        return super.migrateData(source);
    }

    static migrateEffectsToTypedField(source) {
        if (Array.isArray(source.effects) && source.effects.length > 0) {
            source.effects = Object.fromEntries(
                source.effects.map(o => {
                    return [foundry.utils.randomID(), o];
                })
            );
        }
    }
}
