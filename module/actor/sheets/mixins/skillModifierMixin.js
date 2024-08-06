
export let skillModifierMixin = {
  async _onAddSkillModifier(event) {
    let stat = event.currentTarget.closest(".skill").dataset.stat;
    let skill = event.currentTarget.closest(".skill").dataset.skill;
    let newModifierList = []
    if (this.actor.system.skills[stat][skill].modifiers) {
      newModifierList = this.actor.system.skills[stat][skill].modifiers
    }
    newModifierList.push({ name: "Modifier", value: 0 })

    this.actor.update({ [`system.skills.${this.skillMap[skill].attribute.name}.${skill}.modifiers`]: newModifierList });
  },

  _onSkillModifierDisplay(event) {
    event.preventDefault();
    let skill = event.currentTarget.closest(".skill").dataset.skill;

    this.actor.update({ [`system.skills.${this.skillMap[skill].attribute.name}.${skill}.isOpened`]: !this.actor.system.skills[this.skillMap[skill].attribute.name][skill].isOpened });
  },

  async _onSkillModifierRemove(event) {
    let stat = event.currentTarget.closest(".skill").dataset.stat;
    let skill = event.currentTarget.closest(".skill").dataset.skill;

    let prevModList = this.actor.system.skills[stat][skill].modifiers;
    const newModList = Object.values(prevModList).map((details) => details);
    const idxToRm = newModList.findIndex((v) => v.id === event.target.dataset.id);
    newModList.splice(idxToRm, 1);

    this.actor.update({ [`system.skills.${this.skillMap[skill].attribute.name}.${skill}.modifiers`]: newModList });
  },

  async _onSkillModifierEdit(event) {
    let stat = event.currentTarget.closest(".skill").dataset.stat;
    let skill = event.currentTarget.closest(".skill").dataset.skill;

    let element = event.currentTarget;
    let itemId = element.closest(".list-modifiers").dataset.id;

    let field = element.dataset.field;
    let value = element.value
    let modifiers = this.actor.system.skills[stat][skill].modifiers;

    let objIndex = modifiers.findIndex((obj => obj.id == itemId));
    modifiers[objIndex][field] = value

    this.actor.update({ [`system.skills.${this.skillMap[skill].attribute.name}.${skill}.modifiers`]: modifiers });
  },


  skillModifierListener(html) {
    html.find(".add-skill-modifier").on("click", this._onAddSkillModifier.bind(this));
    html.find(".skill-modifier-display").on("click", this._onSkillModifierDisplay.bind(this));
    html.find(".skill-mod-edit").on("blur", this._onSkillModifierEdit.bind(this));
    html.find(".delete-skill-modifier").on("click", this._onSkillModifierRemove.bind(this));



  }

}