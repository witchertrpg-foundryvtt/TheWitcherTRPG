import WitcherItemSheet from './WitcherItemSheet.js';
import WitcherConsumableConfigurationSheet from './configurations/WitcherConsumableConfigurationSheet.js';

export default class WitcherValuableSheet extends WitcherItemSheet {
    configuration = new WitcherConsumableConfigurationSheet({ document: this.item });

    /** @override */
    getData() {
        const data = super.getData();

        data.selects = this.createSelects();

        return data;
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
