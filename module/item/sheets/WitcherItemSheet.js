import WitcherConfigurationSheet from './configurations/WitcherConfigurationSheet.js';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;
const { ux } = foundry.applications;

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
        context.systemFields = this.document.system.schema.fields;
        context.enrichedText = await this.document.system.enrichedText?.();

        context.data = context.item.system;

        context.showConfig = !!this.configuration;

        return context;
    }

    async _onRender(context, options) {
        await super._onRender(context, options);

        new foundry.applications.ux.DragDrop.implementation({
            dragSelector: '.draggable',
            permissions: {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this)
            },
            callbacks: {
                drop: this._onDrop.bind(this)
            }
        }).bind(this.element);

        this.element
            .querySelectorAll('input[data-action=editEffect]')
            .forEach(input => input.addEventListener('focusout', this._onEditEffect.bind(this)));
        this.element
            .querySelectorAll('textarea[data-action=editEffect]')
            .forEach(input => input.addEventListener('focusout', this._onEditEffect.bind(this)));
        this.element
            .querySelectorAll('select[data-action=editEffect]')
            .forEach(input => input.addEventListener('input', this._onEditEffect.bind(this)));

        this.activateListeners(this.element);
    }

    activateListeners(html) {

    }

    _canDragStart() {
        return false;
    }

    _canDragDrop() {
        return this.isEditable;
    }

    /**
     * An event that occurs when data is dropped into a drop target.
     * @param {DragEvent} event
     * @protected
     */
    async _onDrop(event) {
        if (!this.isEditable) return;
        const data = ux.TextEditor.implementation.getDragEventData(event);

        // Dropped Documents
        const documentClass = foundry.utils.getDocumentClass(data.type);
        if (documentClass) {
            const document = await documentClass.fromDropData(data);
            return this._onDropDocument(event, document);
        }

        return data;
    }

    /**
     * Handle a dropped document on the Document Sheet.
     * @template {Document} TDocument
     * @param {DragEvent} event           The initiating drop event.
     * @param {TDocument} document        The resolved Document instance.
     * @returns {Promise<TDocument|null>} A Document of the same type as the dropped one in case of a successful result,
     *                                    or null in case of failure or no action being taken.
     * @protected
     */
    async _onDropDocument(event, document) {
        switch (document.documentName) {
            case 'ActiveEffect':
                return (await this._onDropActiveEffect(event, document)) ?? null;
            case 'Actor':
                return (await this._onDropActor(event, document)) ?? null;
            case 'Item':
                return (await this._onDropItem(event, document)) ?? null;
            case 'Folder':
                return (await this._onDropFolder(event, document)) ?? null;
            default:
                return null;
        }
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
