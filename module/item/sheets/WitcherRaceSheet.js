import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherRaceSheet extends WitcherItemSheet {
    static DEFAULT_OPTIONS = {
        position: {
            width: 600,
        },
    };
    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/race-sheet.hbs`,
            scrollable: ['']
        }
    };
}
