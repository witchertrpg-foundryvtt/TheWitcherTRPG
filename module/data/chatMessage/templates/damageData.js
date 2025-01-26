import damageProperties from '../../item/templates/combat/damagePropertiesData.js';
import critData from './critData.js';
import locationData from './locationData.js';

const fields = foundry.data.fields;

export default function damageData() {
    return {
        itemUuid: new fields.DocumentUUIDField(),
        formula: new fields.StringField(),
        crit: new fields.SchemaField(critData()),
        strike: new fields.StringField(),
        type: new fields.StringField(),
        originalLocation: new fields.StringField(),
        location: new fields.SchemaField(locationData()),
        properties: new fields.SchemaField(damageProperties())
    };
}
