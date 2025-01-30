import defenseOptions from '../item/templates/combat/defenseOptionsData.js';
import BaseMessageData from './baseMessageData.js';
import attackData from './templates/attackData.js';
import damageData from './templates/damageData.js';

const fields = foundry.data.fields;

export default class AttackMessageData extends BaseMessageData {
    /**
     * Key information about this ChatMessage subtype
     */
    static metadata = Object.freeze({
        type: 'attack'
    });

    static defineSchema() {
        let commonData = super.defineSchema();
        return {
            ...commonData,

            attacker: new fields.DocumentUUIDField(),
            attack: new fields.SchemaField(attackData()),
            ...defenseOptions(),
            damage: new fields.SchemaField(damageData())
        };
    }

    get attackRoll() {
        return this.rollTotal;
    }
}
