export let temporaryItemImprovementMixin = {
    getActiveEffectsItemImprovementPaths() {
        return {
            ...this.getItemDamageSuggestions()
        };
    },

    getItemDamageSuggestions() {
        return {
            baseDamage: {
                label: `${game.i18n.localize('WITCHER.Weapon.Damage')}`,
                value: 'system.damage',
                group: game.i18n.localize('WITCHER.Effect.wizard.Item.damage')
            },
            oilEffect: {
                label: `${game.i18n.localize('WITCHER.Damage.oil')}`,
                value: 'system.damageProperties.oilEffect',
                group: game.i18n.localize('WITCHER.Effect.wizard.Item.damage')
            },
            silverDamage: {
                label: `${game.i18n.localize('WITCHER.Damage.silverDmg')}`,
                value: 'system.damageProperties.silverDamage',
                group: game.i18n.localize('WITCHER.Effect.wizard.Item.damage')
            }
        };
    }
};
