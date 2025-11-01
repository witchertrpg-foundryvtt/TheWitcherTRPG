import WitcherItemSheet from './WitcherItemSheet.js';
import WitcherConsumableConfigurationSheet from './configurations/WitcherConsumableConfigurationSheet.js';

export default class WitcherValuableSheet extends WitcherItemSheet {
    configuration = new WitcherConsumableConfigurationSheet({ document: this.document });

    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/valuable-sheet.hbs`,
            scrollable: ['']
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.selects = this.createSelects();

        return context;
    }

    createSelects() {
        return {
            type: {
                'general': 'WITCHER.Valuable.General',
                'toolkit': 'WITCHER.Valuable.Toolkit',
                'food-drink': 'WITCHER.Valuable.Food&Drinks',
                'clothing': 'WITCHER.Valuable.Clothings',
                'alchemical-item': 'WITCHER.Valuable.AlchemicalItem',
                'mount-accessories': 'WITCHER.Valuable.MountAccessories',
                'quest-item': 'WITCHER.Valuable.QuestItem'
            }
        };
    }
}
