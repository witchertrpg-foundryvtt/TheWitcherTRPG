const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export default class WitcherConfigurationSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
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
            create: WitcherConfigurationSheet.onManageActiveEffect,
            toggle: WitcherConfigurationSheet.onManageActiveEffect,
            edit: WitcherConfigurationSheet.onManageActiveEffect,
            delete: WitcherConfigurationSheet.onManageActiveEffect
        }
    };

    static PARTS = {
        header: {
            template: `systems/TheWitcherTRPG/templates/sheets/item/configuration/tabs/header.hbs`
        },
        tabs: {
            // Foundry-provided generic template
            template: 'templates/generic/tab-navigation.hbs'
        },
        general: {
            template: 'systems/TheWitcherTRPG/templates/sheets/item/configuration/tabs/general.hbs',
            scrollable: ['']
        },
        activeEffects: {
            template: 'systems/TheWitcherTRPG/templates/sheets/item/configuration/tabs/activeEffectConfiguration.hbs',
            scrollable: ['']
        }
    };

    static TABS = {
        primary: {
            tabs: [{ id: 'general' }, { id: 'activeEffects' }],
            initial: 'general',
            labelPrefix: 'WITCHER.Item.Settings'
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.config = CONFIG.WITCHER;

        this.options.classes.push(`item-${this.item.type}`);
        context.item = this.document;

        // Prepare active effects for easier access
        context.effects = this.prepareActiveEffectCategories(this.item.effects);

        context.systemFields = this.document.system.schema.fields;

        return context;
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
                type: 'temporary',
                label: game.i18n.localize('WITCHER.activeEffect.temporary'),
                effects: []
            },
            passive: {
                type: 'passive',
                label: game.i18n.localize('WITCHER.activeEffect.passive'),
                effects: []
            },
            inactive: {
                type: 'inactive',
                label: game.i18n.localize('WITCHER.activeEffect.inactive'),
                effects: []
            },
            temporaryItemImprovement: {
                type: 'temporaryItemImprovement',
                label: game.i18n.localize('WITCHER.activeEffect.temporaryItemImprovement'),
                effects: []
            }
        };

        // Iterate over active effects, classifying them into categories
        for (let e of effects) {
            if (e.disabled) categories.inactive.effects.push(e);
            else if (e.isTemporaryItemImprovement && !e.isAppliedTemporaryItemImprovement)
                categories.temporaryItemImprovement.effects.push(e);
            else if (e.isTemporary) categories.temporary.effects.push(e);
            else categories.passive.effects.push(e);
        }
        return categories;
    }

    /**
     * Manage Active Effect instances through an Actor or Item Sheet via effect control buttons.
     * @param {MouseEvent} event      The left-click event on the effect control
     * @param {HTMLElement} element   The element which is the target of the event
     * @returns {object}              effect function
     */
    static async onManageActiveEffect(event, element) {
        event.preventDefault();
        const li = element.closest('li');
        const effect = li.dataset.effectId ? this.document.effects.get(li.dataset.effectId) : null;
        switch (element.dataset.action) {
            case 'create':
                return this.document.createEmbeddedDocuments('ActiveEffect', [
                    {
                        type:
                            li.dataset.effectType === 'temporaryItemImprovement' ? 'temporaryItemImprovement' : 'base',
                        name: this.document.name,
                        icon: this.document.img,
                        origin: this.document.uuid,
                        duration: {
                            rounds: li.dataset.effectType === 'temporary' ? 1 : undefined
                        },
                        disabled: li.dataset.effectType === 'inactive'
                    }
                ]);
            case 'edit':
                return effect.sheet.render(true);
            case 'delete':
                return effect.delete();
            case 'toggle':
                return effect.update({ disabled: !effect.disabled });
        }
    }
}
