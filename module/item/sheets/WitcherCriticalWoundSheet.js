import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherCriticalWoundSheet extends WitcherItemSheet {
    static DEFAULT_OPTIONS = {
        position: {
            width: 600,
            height: 620
        }
    };
    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/criticalWound-sheet.hbs`,
            scrollable: ['']
        }
    };

    async _onDropItem(event, item) {
        this.document.update({
            'system.followUp': item.uuid
        });
    }
}
