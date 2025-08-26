import AbilityTemplate from '../../../item/ability-template.js';

export let spellVisualMixin = {
    async createSpellVisuals(roll, damage, options) {
        if (this.createTemplate && this.templateType && this.templateSize) {
            AbilityTemplate.fromItem(this.parent)
                ?.drawPreview()
                .then(templates => {
                    if (this.regionProperties.createRegionFromTemplate) {
                        this.regionProperties.createRegionFromTemplates(templates, roll, damage, options);
                    }

                    return templates;
                })
                .then(templates => this.deleteSpellVisualEffect(templates))
                .catch(() => {});
        }
    },

    async deleteSpellVisualEffect(templates) {
        if (templates && this.visualEffectDuration > 0) {
            setTimeout(() => {
                canvas.scene.deleteEmbeddedDocuments(
                    'MeasuredTemplate',
                    templates.map(effect => effect.id)
                );
            }, this.visualEffectDuration * 1000);
        }
    }
};
