import WitcherConfigurationSheet from './configurations/WitcherConfigurationSheet.js';
import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherHexSheet extends WitcherItemSheet {
    configuration = new WitcherConfigurationSheet(this.item);


    /** @override */
    getData() {
        const data = super.getData();

        data.selects = this.createSelects();

        return data;
    }

    createSelects() {
        return {
            danger: {
                Low: 'WITCHER.Spell.DangerLow',
                Medium: 'WITCHER.Spell.DangerMedium',
                High: 'WITCHER.Spell.DangerHigh'
            }
        };
    }
}
