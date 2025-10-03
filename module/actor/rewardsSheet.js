const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class RewardsSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        window: {
            resizable: true
        },
        position: {
            width: 520,
            height: 480
        },
        classes: ['witcher', 'extended-sheet', 'actor'],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        }
    };

    static PARTS = {
        header: {
            template: `systems/TheWitcherTRPG/templates/sheets/actor/rewards/header.hbs`
        },
        tabs: {
            // Foundry-provided generic template
            template: 'templates/generic/tab-navigation.hbs'
        },
        ip: {
            template: `systems/TheWitcherTRPG/templates/sheets/actor/rewards/ip.hbs`,
            scrollable: ['']
        },
        currency: {
            template: 'systems/TheWitcherTRPG/templates/sheets/actor/rewards/currency.hbs',
            scrollable: ['']
        }
    };

    static TABS = {
        primary: {
            initial: 'ip',
            labelPrefix: 'WITCHER.Actor.rewards',
            tabs: [{ id: 'ip' }, { id: 'currency' }]
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.config = CONFIG.WITCHER;
        context.system = this.document.system;

        return context;
    }
}
