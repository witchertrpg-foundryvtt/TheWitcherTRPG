const fields = foundry.data.fields;

export default class TemporaryHealth extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            addTemporaryHealth: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.profession.skillPath.skill.skillUsage.temporaryHealth.addTemporaryHealth'
            }),
            difficultyCheck: new fields.SchemaField({
                multiplier: new fields.NumberField({
                    initial: 3,
                    label: 'WITCHER.profession.skillPath.skill.skillUsage.temporaryHealth.difficultyCheck.multiplier'
                }),
                stat: new fields.StringField({
                    initial: 'int',
                    label: 'WITCHER.profession.skillPath.skill.skillUsage.temporaryHealth.difficultyCheck.stat',
                    blank: false
                }),
                maxRollOver: new fields.NumberField({
                    initial: 5,
                    label: 'WITCHER.profession.skillPath.skill.skillUsage.temporaryHealth.difficultyCheck.maxRollOver'
                })
            }),
            temporaryHp: new fields.SchemaField({
                value: new fields.StringField({
                    initial: 'd6',
                    label: 'WITCHER.profession.skillPath.skill.skillUsage.temporaryHealth.temporaryHp.value'
                }),
                duration: new fields.StringField({
                    initial: '2*@level',
                    label: 'WITCHER.profession.skillPath.skill.skillUsage.temporaryHealth.temporaryHp.duration'
                })
            })
        };
    }
}
