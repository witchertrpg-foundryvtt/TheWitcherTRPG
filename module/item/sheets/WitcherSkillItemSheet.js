const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export default class WitcherSkillItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        position: {
            width: 520,
            height: 480
        },
        classes: ['witcher', 'sheet', 'item'],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        }
    };

    static PARTS = {
        main: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/skill-item-sheet.hbs`
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.config = CONFIG.WITCHER;

        this.options.classes.push(`item-skill`);
        context.item = this.document;
        var filteredStats = Object.keys(CONFIG.WITCHER.statMap).reduce(function (r, index) {
            if (CONFIG.WITCHER.statMap[index].origin === 'stats') {
                r[index] = CONFIG.WITCHER.statMap[index];
            }
            return r;
        }, {});
        context.stats = filteredStats;

        context.system = context.item.system;

        return context;
    }
}
