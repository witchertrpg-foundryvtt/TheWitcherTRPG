import WitcherConfigurationSheet from './configurations/WitcherConfigurationSheet.js';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export default class WitcherItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        window: {
            resizable: true
        },
        position: {
            width: 520,
            height: 480
        },
        classes: ['witcher', 'sheet', 'item'],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            addEffect: WitcherItemSheet._onAddEffect,
            removeEffect: WitcherItemSheet._oRemoveEffect,
            configureItem: WitcherItemSheet._renderConfigureDialog
        },
        dragDrop: [{ dragSelector: '.items-list .item', dropSelector: null }]
    };

    static PARTS = {};

    static TABS = {};

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'data' }]
        });
    }

    //overwrite in sub-classes
    configuration = new WitcherConfigurationSheet({ document: this.document });

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.config = CONFIG.WITCHER;

        this.options.classes.push(`item-${this.document.type}`);
        context.item = this.document;
        context.data = context.item.system;

        context.showConfig = !!this.configuration;

        return context;
    }

    _onRender(context, options) {
        super._onRender(context, options);

        this.element
            .querySelectorAll('input[data-action=editEffect]')
            .forEach(input => input.addEventListener('focusout', this._onEditEffect.bind(this)));
        this.element
            .querySelectorAll('textarea[data-action=editEffect]')
            .forEach(input => input.addEventListener('focusout', this._onEditEffect.bind(this)));
        this.element
            .querySelectorAll('select[data-action=editEffect]')
            .forEach(input => input.addEventListener('input', this._onEditEffect.bind(this)));
    }

    static async _onAddEffect(event, element) {
        event.preventDefault();
        let newList = this.item.system.effects ?? [];
        newList.push({ percentage: 100 });
        this.item.update({ 'system.effects': newList });
    }

    _onEditEffect(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.id;

        let field = element.dataset.field;
        let value = element.value;

        if (value == 'on') {
            value = element.checked;
        }

        let effects = this.item.system.effects;
        let objIndex = effects.findIndex(obj => obj.id == itemId);
        effects[objIndex][field] = value;

        this.item.update({ 'system.effects': effects });
    }

    static async _oRemoveEffect(event, element) {
        event.preventDefault();
        let itemId = element.closest('.list-item').dataset.id;
        let newList = this.item.system.effects.filter(item => item.id !== itemId);
        this.item.update({ 'system.effects': newList });
    }

    static async _renderConfigureDialog() {
        this.configuration?.render(true);
    }
}
