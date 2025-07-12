import WitcherConfigurationSheet from './configurations/WitcherConfigurationSheet.js';
import WitcherItemSheetV1 from './WitcherItemSheetV1.js';

export default class WitcherHexSheet extends WitcherItemSheetV1 {
    configuration = new WitcherConfigurationSheet({ document: this.item });

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
