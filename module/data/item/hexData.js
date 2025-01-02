import CommonItemData from './commonItemData.js';
import defenseOptions from './templates/combat/defenseOptionsData.js';

const fields = foundry.data.fields;

export default class HexData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();
        return {
            // Using destructuring to effectively append our additional data here
            ...commonData,
            danger: new fields.StringField({ initial: '' }),
            stamina: new fields.NumberField({ initial: 0 }),

            effect: new fields.StringField({ initial: '' }),
            liftRequirement: new fields.StringField({ initial: '' }),

            ...defenseOptions()
        };
    }
}
