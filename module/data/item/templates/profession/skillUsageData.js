import TemporaryHealth from './temporaryHealthData.js';

const fields = foundry.data.fields;

export default class SkillUsage extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            hasCustomEffect: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.profession.skillPath.skill.skillUsage.hasCustomEffect'
            }),
            applySelf: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applySelf'
            }),
            applyOnTarget: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applyOnTarget'
            }),
            temporaryHealth: new fields.EmbeddedDataField(TemporaryHealth)
        };
    }
}
