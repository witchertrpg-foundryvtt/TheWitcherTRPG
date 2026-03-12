import DamageProperties from '../item/templates/combat/damagePropertiesData.js';
import BaseMessageData from './baseMessageData.js';
import damageData from './templates/damageData.js';

const fields = foundry.data.fields;

export default class DamageMessageData extends BaseMessageData {
    /**
     * Key information about this ChatMessage subtype
     */
    static metadata = Object.freeze({
        type: 'damage'
    });

    static defineSchema() {
        let commonData = super.defineSchema();
        return {
            ...commonData,

            damage: new fields.SchemaField({
                ...damageData(),
                properties: new fields.SchemaField({
                    ...DamageProperties.defineSchema(),
                    effects: new fields.ArrayField(
                        new fields.SchemaField({
                            name: new fields.StringField({ initial: '' }),
                            statusEffect: new fields.StringField({ initial: null, nullable: true }),
                            percentage: new fields.NumberField({ initial: 0, min: 0, max: 100 }),
                            varEffect: new fields.BooleanField({ initial: false }),
                            applied: new fields.BooleanField({ initial: false })
                        })
                    )
                })
            })
        };
    }
}
