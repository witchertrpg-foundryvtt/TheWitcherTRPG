export let specialSkillModifierMixin = {
    async _onAddSpecialSkillModifier(event) {
        event.preventDefault();
        let newModifierList = this.actor.system.specialSkillModifiers ?? [];
        newModifierList.push({ id: foundry.utils.randomID() });
        this.actor.update({ 'system.specialSkillModifiers': newModifierList });
    },

    _onEditSpecialSkillModifier(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let modifierId = element.closest('.list-item').dataset.id;
        let value = element.value;
        let modifiers = this.actor.system.specialSkillModifiers;
        let index = modifiers.findIndex(modifier => modifier.id == modifierId);
        modifiers[index].modifier = value;
        this.actor.update({ [`system.specialSkillModifiers`]: modifiers });
    },

    _onRemoveSpecialSkillModifier(event) {
        let element = event.currentTarget;
        let modifierId = element.closest('.list-item').dataset.id;
        let newModifierList = this.actor.system.specialSkillModifiers.filter(modifier => modifier.id !== modifierId);
        this.actor.update({ [`system.specialSkillModifiers`]: newModifierList });
    },

    specialSkillModifierListener(html) {
        html.find('.add-special-skill-modifier').on('click', this._onAddSpecialSkillModifier.bind(this));
        html.find('.edit-special-skill-modifier').on('change', this._onEditSpecialSkillModifier.bind(this));
        html.find('.remove-special-skill-modifier').on('click', this._onRemoveSpecialSkillModifier.bind(this));
    }
};
