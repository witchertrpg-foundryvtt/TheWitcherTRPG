import { baseMixin } from './mixins/baseMixin.js';
import { temporaryItemImprovementMixin } from './mixins/temporaryItemImprovementMixin.js';

const DialogV2 = foundry.applications.api.DialogV2;

export class WitcherActiveEffectConfig extends ActiveEffectConfig {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['witcher', 'sheet', 'active-effect-sheet'],
            template: 'systems/TheWitcherTRPG/templates/sheets/activeEffect/active-effect-config.hbs'
        });
    }

    async _onEffectControl(event) {
        event.preventDefault();
        const button = event.currentTarget;

        let selects;

        switch (this.object.type) {
            case 'base':
                selects = this.getActiveEffectsBasePaths();
                break;
            case 'temporaryItemImprovement':
                selects = this.getActiveEffectsItemImprovementPaths();
                break;
        }

        if (button.dataset.action == 'wizard') {
            const dialogTemplate = await renderTemplate(
                'systems/TheWitcherTRPG/templates/dialog/activeEffects/wizard.hbs',
                { selects: selects }
            );

            DialogV2.prompt({
                content: dialogTemplate,
                modal: true,
                ok: {
                    callback: (event, button, dialog) => {
                        let paths = button.form.elements.path.value.split(',');
                        let newChanges = this.object.changes;
                        paths.forEach(path => {
                            newChanges.push({
                                key: path
                            });
                        });

                        this.object.update({
                            changes: newChanges
                        });
                    }
                }
            });
        } else {
            super._onEffectControl(event);
        }
    }
}

Object.assign(WitcherActiveEffectConfig.prototype, baseMixin);
Object.assign(WitcherActiveEffectConfig.prototype, temporaryItemImprovementMixin);
