import { createEnrichedText } from '../dataUtils.js';

const fields = foundry.data.fields;

export default class CriticalWoundData extends foundry.abstract.TypeDataModel {
    static metadata = Object.freeze({
        type: 'criticalWound'
    });

    static defineSchema() {
        return {
            description: new fields.HTMLField({ initial: '' }),

            criticalLevel: new fields.StringField({
                initial: 'simple',
                label: 'WITCHER.criticalWound.criticalLevel.label'
            }),
            treatment: new fields.StringField({ initial: 'none', label: 'WITCHER.criticalWound.treatment.label' }),
            location: new fields.StringField({ initial: 'torso' }),
            lesserEffect: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.criticalWound.lesserEffect.label',
                hint: 'WITCHER.criticalWound.lesserEffect.hint'
            }),

            daysHealed: new fields.NumberField({ initial: 0 }),
            healingTime: new fields.NumberField({ initial: 0 }),
            sterilized: new fields.BooleanField({ initial: false }),

            followUp: new fields.DocumentUUIDField({
                type: 'Item',
                label: 'WITCHER.criticalWound.followUp',
                hint: 'WITCHER.criticalWound.followUpHint'
            })
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
                break;
            case 'complex':
                this.healingTime = Math.max(12 - actor.system.stats.body.max, 1);
                break;
            case 'difficult':
                this.healingTime = Math.max(15 - actor.system.stats.body.max, 1);
                break;
        }
    }

    async enrichedText() {
        return {
            description: await createEnrichedText(this, this.description, 'description')
        };
    }

    async heal({ sterilized }) {
        let updates = {};
        if (this.treatment == 'treated') {
            this.daysHealed += 1;
            if (sterilized && !this.sterilized) {
                this.daysHealed += 2;
                updates = {
                    ...updates,
                    'system.sterilized': true
                };
            }
            updates = {
                ...updates,
                'system.daysHealed': this.daysHealed
            };
        }

        if (this.daysHealed >= this.healingTime && this.criticalLevel != 'deadly') {
            //remove crit
            this.treat();
        } else {
            if (Object.keys(updates)) {
                this.parent.update(updates);
            }
        }
    }

    async treat() {
        if (this.followUp) {
            let actor = this.parent.parent;
            let followUpItem = await fromUuid(this.followUp);
            actor.createEmbeddedDocuments('Item', [followUpItem]);
        }

        this.parent.delete();
    }

    get canHaveTemporaryItemImprovement() {
        return false;
    }
}
