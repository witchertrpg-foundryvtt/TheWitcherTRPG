import BaseMessageData from './baseMessageData.js';

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
            attackRoll: new fields.NumberField(),
            defenseOptions: new fields.SetField(new fields.StringField(), {
                label: 'WITCHER.Item.Settings.Attacks.defendWith.label',
                hint: 'WITCHER.Item.Settings.Attacks.defendWith.hint'
            })
        };
    }
}
