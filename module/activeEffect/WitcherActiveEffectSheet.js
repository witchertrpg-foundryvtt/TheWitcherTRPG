import { baseMixin } from './mixins/baseMixin.js';
import { temporaryItemImprovementMixin } from './mixins/temporaryItemImprovementMixin.js';

const DialogV2 = foundry.applications.api.DialogV2;

export class WitcherActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {
    static DEFAULT_OPTIONS = {
        actions: {
            wizard: WitcherActiveEffectConfig.wizardAction
        }
    };

    /** @override */
    static PARTS = {
        header: { template: 'templates/sheets/active-effect/header.hbs' },
        tabs: { template: 'templates/generic/tab-navigation.hbs' },
        details: { template: 'templates/sheets/active-effect/details.hbs', scrollable: [''] },
        duration: { template: 'templates/sheets/active-effect/duration.hbs' },
        changes: {
            template: 'templates/sheets/active-effect/changes.hbs',
            templates: ['templates/sheets/active-effect/change.hbs'],
            scrollable: ['ol[data-changes]']
        },
        systemSpecific: {
            template: 'systems/TheWitcherTRPG/templates/sheets/activeEffect/system-specific.hbs',
            scrollable: ['']
        },
        footer: { template: 'templates/generic/form-footer.hbs' }
    };

    static TABS = {
        sheet: {
            ...super.TABS.sheet,
            tabs: [...super.TABS.sheet.tabs, { id: 'systemSpecific' }]
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.systemFields = this.document.system.schema.fields;
        return context;
    }

    _onRender(context, options) {
        super._onRender(context, options);

        this.autocomplete();

        const addButton = this.element.querySelector('button.inline-control.icon.fa-regular.fa-square-plus');
        const wizard = document.createElement('a');
        wizard.setAttribute('data-action', 'wizard');
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-wand-magic-sparkles';
        wizard.appendChild(icon);
        addButton.parentNode.insertBefore(wizard, addButton.nextSibling);
    }

    static async wizardAction() {
        let selects;

        switch (this.document.type) {
            case 'base':
                selects = this.getActiveEffectsBasePaths();
                break;
            case 'temporaryItemImprovement':
                selects = this.getActiveEffectsItemImprovementPaths();
                break;
        }

        const dialogTemplate = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherTRPG/templates/dialog/activeEffects/wizard.hbs',
            {
                selects: selects
            }
        );

        DialogV2.prompt({
            content: dialogTemplate,
            modal: true,
            ok: {
                callback: (event, button, dialog) => {
                    let paths = button.form.elements.path.value.split(',');
                    let newChanges = this.document.changes;
                    paths.forEach(path => {
                        newChanges.push({
                            key: path
                        });
                    });

                    this.document.update({
                        changes: newChanges
                    });
                }
            }
        });
    }

    async autocomplete() {
        let html = this.element;
        const effectsSection = html.querySelector("section[data-tab='changes']");
        const inputFields = effectsSection.querySelectorAll('.key input');
        const datalist = document.createElement('datalist');
        const attributeKeyOptions = {};

        datalist.id = 'attribute-key-list';
        inputFields.forEach(inputField => {
            inputField.setAttribute('list', 'attribute-key-list');
        });

        let config;
        if (this.document.parent.documentName === 'Actor') {
            config = CONFIG.Actor;
        }

        if (this.document.parent.documentName === 'Item') {
            config = CONFIG.Item;
        }

        for (const datamodel in config.dataModels) {
            config.dataModels[datamodel].schema.apply(function () {
                if (!(this instanceof foundry.data.fields.SchemaField)) {
                    attributeKeyOptions[this.fieldPath] = game.i18n.localize(this.label);
                }
            });
        }

        const sortedKeys = Object.keys(attributeKeyOptions).sort();
        sortedKeys.forEach(key => {
            const attributeKeyOption = document.createElement('option');
            attributeKeyOption.value = key;
            if (!!attributeKeyOptions[key]) attributeKeyOption.label = attributeKeyOptions[key];
            datalist.appendChild(attributeKeyOption);
        });

        effectsSection.append(datalist);
    }
}

Object.assign(WitcherActiveEffectConfig.prototype, baseMixin);
Object.assign(WitcherActiveEffectConfig.prototype, temporaryItemImprovementMixin);
