import modifier from '../actor/templates/common/modifierData.js';

const fields = foundry.data.fields;

export default class SkillItemData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            attribute: new fields.StringField({ initial: '' }),
            value: new fields.NumberField({ initial: 0 }),
            label: new fields.StringField({ initial: '' }),
            isOpened: new fields.BooleanField({ initial: false }),
            modifiers: new fields.ArrayField(new fields.SchemaField(modifier())),
            activeEffectModifiers: new fields.NumberField({ initial: 0 }),
            isProfession: new fields.BooleanField({ initial: false }),
            isPickup: new fields.BooleanField({ initial: false }),
            isLearned: new fields.BooleanField({ initial: false })
        };
    }
}
