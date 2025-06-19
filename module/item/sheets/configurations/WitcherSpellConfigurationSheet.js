import WitcherPropertiesConfigurationSheet from './WitcherPropertiesConfigurationSheet.js';

export default class WitcherSpellConfigurationSheet extends WitcherPropertiesConfigurationSheet {
    static PARTS = {
        ...super.PARTS,
        general: {
            template: 'systems/TheWitcherTRPG/templates/sheets/item/configuration/tabs/spellGeneral.hbs',
            scrollable: ['']
        }
    };
}
