import itemEffect from './itemEffectData.js';

const fields = foundry.data.fields;

export default class ConsumablePropertiesData extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            doesHeal: new fields.BooleanField({ initial: false, label: 'WITCHER.Item.ConsumeProperties.doesHeal' }),
            heal: new fields.StringField({ initial: '', label: 'WITCHER.Item.ConsumeProperties.heal' }),

            addsTempHp: new fields.BooleanField({ initial: false, label: 'WITCHER.Item.ConsumeProperties.addsTempHp' }),
            temporaryHp: new fields.SchemaField({
                value: new fields.StringField({ initial: '', label: 'WITCHER.Item.ConsumeProperties.temporaryHp.value' }),
                duration: new fields.NumberField({ initial: 0, label: 'WITCHER.Item.ConsumeProperties.temporaryHp.duration' })
            }),

            effects: new fields.ArrayField(new fields.SchemaField(itemEffect())),
            removesEffects: new fields.ArrayField(new fields.SchemaField(itemEffect()))
        };
    }
}
