export default class WitcherItemSheet extends foundry.appv1.sheets.ItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['witcher', 'sheet', 'item'],
            width: 520,
            height: 480,
            tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'data' }],
            dragDrop: [
                {
                    dragSelector: '.items-list .item',
                    dropSelector: null
                }
            ]
        });
    }

    //overwrite in sub-classes
    configuration = undefined;

    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/item/${this.object.type}-sheet.hbs`;
    }

    /** @override */
    getData() {
        const context = super.getData();
        context.config = CONFIG.WITCHER;

        this.options.classes.push(`item-${this.item.type}`);
        context.data = context.item?.system;

        context.showConfig = !!this.configuration;

        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.add-effect').on('click', this._onAddEffect.bind(this));
        html.find('.edit-effect').on('blur', this._onEditEffect.bind(this));
        html.find('.remove-effect').on('click', this._oRemoveEffect.bind(this));

        html.find('.configure-item').on('click', this._renderConfigureDialog.bind(this));

        html.find('input').focusin(ev => this._onFocusIn(ev));
    }

    _onAddEffect(event) {
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

    _oRemoveEffect(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.id;
        let newList = this.item.system.effects.filter(item => item.id !== itemId);
        this.item.update({ 'system.effects': newList });
    }

    async _renderConfigureDialog() {
        //TODO remove when everything is v2
        this.configuration?.render(true) ?? this.configuration?._render(true);
    }

    _onFocusIn(event) {
        event.currentTarget.select();
    }
}
