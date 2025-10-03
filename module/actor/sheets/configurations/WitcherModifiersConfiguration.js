const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;
import { statMixin } from '../mixins/statMixin.js';

export default class WitcherModifiersConfiguration extends HandlebarsApplicationMixin(ItemSheetV2) {
    constructor(options = {}) {
        super(options);
        
        this.type = options.type;
        this.skillKey = options.skillKey
    }

    /** @override */
    static DEFAULT_OPTIONS = {
        window: {
            resizable: true
        },
        position: {
            width: 520,
        },
        classes: ['witcher', 'sheet', 'actor', 'modifier-configuration'],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
        }
    };

    static PARTS = {
        stats: {
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/configuration/app/edit-stats.hbs'
        },
        skills: {
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/configuration/app/edit-skills.hbs'
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.config = CONFIG.WITCHER;
        context.config.statLabels = Object.keys(CONFIG.WITCHER.statMap).reduce((obj, stat) => {
            obj[stat] = CONFIG.WITCHER.statMap[stat].label ?? CONFIG.WITCHER.statMap[stat].labelShort;
            return obj;
        }, {});

        context.system = this.document.system;
        context.skillKey = this.skillKey;
        context.type = this.type;

        return context;
    };
}

Object.assign(WitcherModifiersConfiguration.prototype, statMixin);
