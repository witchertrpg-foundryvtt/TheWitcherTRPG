import damageProperties from '../item/templates/combat/damagePropertiesData.js';
import BaseMessageData from './baseMessageData.js';

const fields = foundry.data.fields;

export default class DefenseMessageData extends BaseMessageData {
    /**
     * Key information about this ChatMessage subtype
     */
    static metadata = Object.freeze({
        type: 'defense'
    });

    static defineSchema() {
        let commonData = super.defineSchema();
        return {
            ...commonData,
            attackWeaponProperties: new fields.SchemaField(damageProperties()),
            defender: new fields.DocumentUUIDField(),
            defense:  new fields.StringField(),
            crit: new fields.SchemaField({
                severity: new fields.StringField(),
                critdamage: new fields.NumberField(),
                bonusdamage: new fields.NumberField(),
                location: new fields.SchemaField({
                    name: new fields.StringField(),
                    alias: new fields.StringField(),
                    locationFormula: new fields.NumberField(),
                    modifier: new fields.NumberField()
                })
            }),
            stun: new fields.SchemaField({
                modifier: new fields.NumberField()
            })
        };
    }

    get attackRoll() {
        return this.rollTotal;
    }
}
