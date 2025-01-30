import WitcherItemSheet from './WitcherItemSheet.js';
import WitcherConfigurationSheet from './configurations/WitcherConfigurationSheet.js';

export default class WitcheProfessionSheet extends WitcherItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['witcher', 'sheet', 'item'],
            width: 800,
            height: 480,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'data' }],
            dragDrop: [
                {
                    dragSelector: '.items-list .item',
                    dropSelector: null
                }
            ]
        });
    }

    configuration = new WitcherConfigurationSheet(this.item);
}
