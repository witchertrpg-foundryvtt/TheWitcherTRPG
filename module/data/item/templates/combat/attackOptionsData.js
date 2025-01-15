const fields = foundry.data.fields;

export default function attackOptions() {
    return {
        attackOptions: new fields.SetField(new fields.StringField({ required: true, blank: false }), {
            initial: source => {
                let options = [];

                if (CONFIG.WITCHER.meleeSkills.includes(source.attackSkill)) options.push('melee');
                if (CONFIG.WITCHER.rangedSkills.includes(source.attackSkill) || source.isThrowable)
                    options.push('ranged');
                return options;
            },
            label: 'WITCHER.Attack.attackOptions.label',
            hint: 'WITCHER.Attack.attackOptions.hint'
        }),
        meleeAttackSkill: new fields.StringField({
            initial: source => source.attackSkill,
            label: 'WITCHER.Attack.meleeAttackSkill.label',
            hint: 'WITCHER.Attack.meleeAttackSkill.hint'
        }),
        rangedAttackSkill: new fields.StringField({
            initial: source => source.attackSkill,
            label: 'WITCHER.Attack.rangedAttackSkill.label',
            hint: 'WITCHER.Attack.rangedAttackSkill.hint'
        }),
        spellAttackSkill: new fields.StringField({
            label: 'WITCHER.Attack.spellAttackSkill.label',
            hint: 'WITCHER.Attack.spellAttackSkill.hint'
        }),
        itemUseAttackSkill: new fields.StringField({
            label: 'WITCHER.Attack.itemUseAttackSkill.label',
            hint: 'WITCHER.Attack.itemUseAttackSkill.hint'
        }),

        applyMeleeBonus: new fields.BooleanField({
            initial: source => CONFIG.WITCHER.meleeSkills.includes(source.attackSkill),
            label: 'WITCHER.Weapon.MeleeBonus'
        }),
        applyRangedMeleeBonus: new fields.BooleanField({
            initial: source => source.applyMeleeBonus,
            label: 'WITCHER.Weapon.rangedMeleeBonus',
            hint: 'WITCHER.Weapon.rangedMeleeBonusHint'
        }),
        isThrowable: new fields.BooleanField({ initial: false, label: 'WITCHER.Weapon.isThrowable' })
    };
}
