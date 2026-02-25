import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherHomelandSheet extends WitcherItemSheet {
    static DEFAULT_OPTIONS = {
        position: {
            width: 600
        }
    };
    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/homeland-sheet.hbs`,
            scrollable: ['']
        }
    };
}
