import WitcherItemSheet from './WitcherItemSheet.js';
import WitcherProfessionConfigurationSheet from './configurations/WitcherProfessionConfigurationSheet.js';

export default class WitcheProfessionSheet extends WitcherItemSheet {
    static DEFAULT_OPTIONS = {
        position: {
            width: 600
        }
    };

    configuration = new WitcherProfessionConfigurationSheet({ document: this.item });

    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/profession-sheet.hbs`,
            scrollable: ['']
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.professionSkills = Object.values(CONFIG.WITCHER.skillMap).map(skill => {
            return { value: skill.name, label: skill.label };
        });

        context.config.statOptions = Object.keys(CONFIG.WITCHER.statTypes)
            .filter(key => key != 'none')
            .map(key => {
                return { value: key, label: CONFIG.WITCHER.statTypes[key] };
            });

        return context;
    }
}
