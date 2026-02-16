import Body from './bodyData.js';
import Craft from './craData.js';
import Dexterity from './dexData.js';
import Empathy from './empData.js';
import Intelligence from './intData.js';
import Reflex from './refData.js';
import Will from './willData.js';

const fields = foundry.data.fields;

export default function skills() {
    return {
        int: new fields.EmbeddedDataField(Intelligence),
        ref: new fields.EmbeddedDataField(Reflex),
        dex: new fields.EmbeddedDataField(Dexterity),
        body: new fields.EmbeddedDataField(Body),
        emp: new fields.EmbeddedDataField(Empathy),
        cra: new fields.EmbeddedDataField(Craft),
        will: new fields.EmbeddedDataField(Will)
    };
}
