export class WitcherActiveEffectConfig extends ActiveEffectConfig {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['witcher', 'sheet', 'active-effect-sheet'],
            template: 'systems/TheWitcherTRPG/templates/sheets/activeEffect/active-effect-config.hbs'
        });
    }
}
