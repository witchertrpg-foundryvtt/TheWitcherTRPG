export let customSkillMixin = {
    customSkillListener(html) {
        let thisActor = this.actor;

        html.find('#custom-rollable').on('click', thisActor.rollCustomSkillCheck.bind(thisActor));
        html.find('.remove-custom-skill').on('click', this.removeCustomSkill.bind(this));

        html.find('.custom-skill-modifier-display').on('click', this.customSkillModifierDisplay.bind(this));
        html.find('.add-custom-skill-modifier').on('click', this._onAddCustomSkillModifier.bind(this));
        html.find('.edit-custom-skill-modifier').on('blur', this._onEditCustomSkillModifier.bind(this));
        html.find('.delete-custom-skill-modifier').on('click', this._onRemoveCustomSkillModifier.bind(this));
    },

    removeCustomSkill(event) {
        this.actor.items.get(event.currentTarget.closest('.item').dataset.itemId).delete();
    },

    customSkillModifierDisplay(event) {
        let customSkill = this.actor.items.find(item => item.id == event.currentTarget.closest('.item').dataset.itemId);

        customSkill.update({
            'system.isOpened': !customSkill.system.isOpened
        });
    },

    async _onAddCustomSkillModifier(event) {
        let customSkill = this.actor.items.find(item => item.id == event.currentTarget.closest('.item').dataset.itemId);
        let newModifierList = customSkill.system.modifiers ?? [];
        newModifierList.push({ name: 'Modifier', value: 0 });
        customSkill.update({
            'system.modifiers': newModifierList
        });
    },

    async _onRemoveCustomSkillModifier(event) {
        let customSkill = this.actor.items.find(item => item.id == event.currentTarget.closest('.item').dataset.itemId);

        let prevModList = customSkill.system.modifiers;
        const newModList = Object.values(prevModList).map(details => details);
        const idxToRm = newModList.findIndex(v => v.id === event.target.dataset.id);
        newModList.splice(idxToRm, 1);

        customSkill.update({ 'system.modifiers': newModList });
    },

    async _onEditCustomSkillModifier(event) {
        let customSkill = this.actor.items.find(item => item.id == event.currentTarget.closest('.item').dataset.itemId);

        let element = event.currentTarget;
        let itemId = element.closest('.list-modifiers').dataset.id;

        let field = element.dataset.field;
        let value = element.value;
        let modifiers = customSkill.system.modifiers;

        let objIndex = modifiers.findIndex(obj => obj.id == itemId);
        modifiers[objIndex][field] = value;

        customSkill.update({ 'system.modifiers': modifiers });
    }
};
