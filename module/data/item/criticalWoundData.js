import { createEnrichedText } from '../dataUtils.js';

const fields = foundry.data.fields;

export default class CriticalWoundData extends foundry.abstract.TypeDataModel {
    static metadata = Object.freeze({
        type: 'criticalWound'
    });

    static defineSchema() {
        return {
            description: new fields.HTMLField({ initial: '' }),

            criticalLevel: new fields.StringField({ initial: 'simple' }),
            treatment: new fields.StringField({ initial: 'none' }),
            location: new fields.StringField({ initial: 'torso' }),

            daysHealed: new fields.NumberField({ initial: 0 }),
            healingTime: new fields.NumberField({ initial: 0 }),
            sterilized: new fields.BooleanField({ initial: false }),

            followUpWound: new fields.DocumentUUIDField()
        };
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        let actor = this.parent.parent;
        if (actor) {
            this.calculateHealingTime(actor);
        }
    }

    calculateHealingTime(actor) {
        switch (this.criticalLevel) {
            case 'simple':
                this.healingTime = Math.max(8 - actor.system.stats.body.max, 1);
            case 'complex':
                this.healingTime = Math.max(12 - actor.system.stats.body.max, 1);
            case 'difficult':
                this.healingTime = Math.max(15 - actor.system.stats.body.max, 1);
        }
    }

    async enrichedText() {
        return {
            description: await createEnrichedText(this, this.description, 'description')
        };
    }

    async heal() {
        if (this.treatment == 'treated') {
            this.daysHealed += 1;
        }

        if (this.daysHealed >= this.healingTime && this.gravity != 'deadly') {
            //remove crit
            console.log(this);
        } else {
            //update daysHealed
        }
    }

    get canHaveTemporaryItemImprovement() {
        return false;
    }
}
