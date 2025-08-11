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
            attackWeaponProperties: new fields.SchemaField(damageProperties())
        };
    }

    get attackRoll() {
        return this.rollTotal;
    }
}
