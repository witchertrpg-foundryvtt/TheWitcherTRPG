
export default class WitcherItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["witcher", "sheet", "item"],
            width: 520,
            height: 480,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "data" }],
            dragDrop: [{
                dragSelector: ".items-list .item",
                dropSelector: null
            }],
        });
    }

    //overwrite in sub-classes
    configuration = undefined;

    get template() {
        return `systems/TheWitcherTRPG/templates/sheets/${this.object.type}-sheet.hbs`;
    }

    /** @override */
    getData() {
        const data = super.getData();
        data.config = CONFIG.WITCHER;

        this.options.classes.push(`item-${this.item.type}`)
        data.data = data.item?.system
        // Prepare active effects for easier access
        data.effects = this.prepareActiveEffectCategories(this.item.effects);

        data.showConfig = !!this.configuration

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".add-global-modifier").on("click", this._onAddGlobalModifier.bind(this));
        html.find(".edit-global-modifier").on("blur", this._onEditGlobalModifier.bind(this));
        html.find(".remove-global-modifier").on("click", this._oRemoveGlobalModifier.bind(this));

        html.find(".add-effect").on("click", this._onAddEffect.bind(this));
        html.find(".edit-effect").on("blur", this._onEditEffect.bind(this));
        html.find(".remove-effect").on("click", this._oRemoveEffect.bind(this));

        html.find(".configure-item").on("click", this._renderConfigureDialog.bind(this));

        html.find("input").focusin(ev => this._onFocusIn(ev));

        // Active Effect management
        html.on("click", ".effect-control", (ev) =>
            this.onManageActiveEffect(ev, this.item)
        );
    }

    _onAddGlobalModifier(event) {
        event.preventDefault();
        let newList = []
        if (this.item.system.globalModifiers) {
            newList = this.item.system.globalModifiers
        }
        newList.push("global modifier")
        this.item.update({ 'system.globalModifiers': newList });
    }

    _onEditGlobalModifier(event) {
        event.preventDefault();
        let element = event.currentTarget;

        let value = element.value
        let oldValue = element.defaultValue

        let modifiers = this.item.system.globalModifiers

        modifiers[modifiers.indexOf(oldValue)] = value;

        this.item.update({ 'system.globalModifiers': modifiers });

    }

    _oRemoveGlobalModifier(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".list-item").dataset.id;
        let newList = this.item.system.globalModifiers.filter(modifier => modifier !== itemId)
        this.item.update({ 'system.globalModifiers': newList });
    }

    _onAddEffect(event) {
        event.preventDefault();
        let newList = this.item.system.effects ?? []
        newList.push({ percentage: 100 })
        this.item.update({ 'system.effects': newList });
    }

    _onEditEffect(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".list-item").dataset.id;

        let field = element.dataset.field;
        let value = element.value

        if (value == "on") {
            value = element.checked;
        }

        let effects = this.item.system.effects
        let objIndex = effects.findIndex((obj => obj.id == itemId));
        effects[objIndex][field] = value

        this.item.update({ 'system.effects': effects });

    }

    _oRemoveEffect(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".list-item").dataset.id;
        let newList = this.item.system.effects.filter(item => item.id !== itemId)
        this.item.update({ 'system.effects': newList });
    }

    async _renderConfigureDialog() {
        this.configuration?._render(true)
    }

    _handleRender(html) {
        html.find(".add-effect").on("click", (args) => { console.log(args.currentTarget.dataset) });
    }

    _handleConfiguration(html) {
        const formElement = html[0].querySelector('form');
        const formData = new FormDataExtended(formElement);

        this._updateItem(formData.object);
    }

    _updateItem(formData) {
        let updateData = {}
        for (let [key, value] of Object.entries(formData)) {
            updateData[key] = value
        }

        this.item.update(updateData);
    }

    _onFocusIn(event) {
        event.currentTarget.select();
    }

    /**
     * Prepare the data structure for Active Effects which are currently embedded in an Actor or Item.
     * @param {ActiveEffect[]} effects    A collection or generator of Active Effect documents to prepare sheet data for
     * @returns {object}                   Data for rendering
     */
    prepareActiveEffectCategories(effects) {
        // Define effect header categories
        const categories = {
            temporary: {
                type: "temporary",
                label: game.i18n.localize("WITCHER.activeEffect.temporary"),
                effects: []
            },
            passive: {
                type: "passive",
                label: game.i18n.localize("WITCHER.activeEffect.passive"),
                effects: []
            },
            inactive: {
                type: "inactive",
                label: game.i18n.localize("WITCHER.activeEffect.inactive"),
                effects: []
            }
        };

        // Iterate over active effects, classifying them into categories
        for (let e of effects) {
            if (e.disabled) categories.inactive.effects.push(e);
            else if (e.isTemporary) categories.temporary.effects.push(e);
            else categories.passive.effects.push(e);
        }
        return categories;
    }

    /**
     * Manage Active Effect instances through an Actor or Item Sheet via effect control buttons.
     * @param {MouseEvent} event      The left-click event on the effect control
     * @param {Actor|Item} owner      The owning document which manages this effect
     * @returns {object}              effect function
     */
    onManageActiveEffect(event, owner) {
        event.preventDefault();
        const a = event.currentTarget;
        const li = a.closest("li");
        const effect = li.dataset.effectId
            ? owner.effects.get(li.dataset.effectId)
            : null;
        switch (a.dataset.action) {
            case "create":
                return owner.createEmbeddedDocuments("ActiveEffect", [
                    {
                        name: game.i18n.format("DOCUMENT.New", {
                            type: game.i18n.localize("DOCUMENT.ActiveEffect")
                        }),
                        icon: "icons/svg/aura.svg",
                        origin: owner.uuid,
                        "duration.rounds":
                            li.dataset.effectType === "temporary" ? 1 : undefined,
                        disabled: li.dataset.effectType === "inactive"
                    },
                ]);
            case "edit":
                return effect.sheet.render(true);
            case "delete":
                return effect.delete();
            case "toggle":
                return effect.update({ disabled: !effect.disabled });
        }
    }
}