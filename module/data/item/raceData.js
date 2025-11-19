import CommonItemData from './commonItemData.js';
import perk from './templates/perkData.js';
import socialStanding from './templates/socialStandingData.js';
import { createEnrichedText } from '../dataUtils.js';

const fields = foundry.data.fields;

export default class RaceData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();
        return {
            // Using destructuring to effectively append our additional data here
            ...commonData,
            description: new fields.HTMLField({ initial: '' }),
            perk1: new fields.SchemaField(perk()),
            perk2: new fields.SchemaField(perk()),
            perk3: new fields.SchemaField(perk()),
            perk4: new fields.SchemaField(perk()),
            socialStanding: new fields.SchemaField(socialStanding())
        };
    }

    async enrichedText() {
        return {
            perk1: await createEnrichedText(this, this.perk1.description, 'perk1.description'),
            perk2: await createEnrichedText(this, this.perk2.description, 'perk2.description'),
            perk3: await createEnrichedText(this, this.perk3.description, 'perk3.description'),
            perk4: await createEnrichedText(this, this.perk4.description, 'perk4.description')
        };
    }
}
