import { baseMixin } from './mixins/baseMixin.js';
import { temporaryItemImprovementMixin } from './mixins/temporaryItemImprovementMixin.js';

const DialogV2 = foundry.applications.api.DialogV2;

export class WitcherActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {
    static DEFAULT_OPTIONS = {
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            wizard: WitcherActiveEffectConfig.wizardAction
        }
    };

    /** @override */
    static PARTS = {
        header: { template: 'templates/sheets/active-effect/header.hbs' },
        tabs: { template: 'templates/generic/tab-navigation.hbs' },
        details: { template: 'systems/TheWitcherTRPG/templates/sheets/activeEffect/details.hbs', scrollable: [''] },
        duration: { template: 'templates/sheets/active-effect/duration.hbs' },
        changes: {
            template: 'systems/TheWitcherTRPG/templates/sheets/activeEffect/active-effect-changes.hbs',
            scrollable: ['ol[data-changes]']
        },
        footer: { template: 'templates/generic/form-footer.hbs' }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.systemFields = this.document.system.schema.fields;
        return context;
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
}

Object.assign(WitcherActiveEffectConfig.prototype, baseMixin);
Object.assign(WitcherActiveEffectConfig.prototype, temporaryItemImprovementMixin);
