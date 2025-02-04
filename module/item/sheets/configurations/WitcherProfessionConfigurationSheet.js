import WitcherConfigurationSheet from './WitcherConfigurationSheet.js';

export default class WitcherDamagePropertiesConfigurationSheet extends WitcherConfigurationSheet {
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.add-effect-damageProperties').on('click', this._onAddEffectDamageProperties.bind(this));
        html.find('.edit-effect-damageProperties').on('blur', this._onEditEffectDamageProperties.bind(this));
        html.find('.remove-effect-damageProperties').on('click', this._oRemoveEffectDamageProperties.bind(this));
    }

    _onAddEffectDamageProperties(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let skillName = element.dataset.target;

        let skillObject = this.findSkillWithName(skillName);

        let newList = skillObject.skill.skillAttack.damageProperties.effects ?? [];
        newList.push({ percentage: 0 });
        this.item.update({ [`system.${skillObject.path}.skillAttack.damageProperties.effects`]: newList });
    }

    _onEditEffectDamageProperties(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let effectId = element.closest('.list-item').dataset.id;

        let field = element.dataset.field;
        let value = element.value;

        if (value == 'on') {
            value = element.checked;
        }

        console.log(element.closest('.list-item').dataset);

        let skillName = element.closest('.list-item').dataset.target;
        let skillObject = this.findSkillWithName(skillName);

        let effects = skillObject.skill.skillAttack.damageProperties.effects;
        let objIndex = effects.findIndex(obj => obj.id == effectId);
        effects[objIndex][field] = value;

        this.item.update({ [`system.${skillObject.path}.skillAttack.damageProperties.effects`]: effects });
    }

    _oRemoveEffectDamageProperties(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let effectId = element.closest('.list-item').dataset.id;

        let skillName = element.closest('.list-item').dataset.target;
        let skillObject = this.findSkillWithName(skillName);

        let newList = skillObject.skill.skillAttack.damageProperties.effects.filter(effect => effect.id !== effectId);
        this.item.update({ [`system.${skillObject.path}.skillAttack.damageProperties.effects`]: newList });
    }

    findSkillWithName(skillName) {
        let skillPath = this.document;

        if (this.findSkillWithNameInSkillPath(skillPath.system.skillPath1, skillName)) {
            let skill = this.findSkillWithNameInSkillPath(skillPath.system.skillPath1, skillName);
            return { skill: skill.skill, path: 'skillPath1.' + skill.path };
        }
        if (this.findSkillWithNameInSkillPath(skillPath.system.skillPath2, skillName)) {
            let skill = this.findSkillWithNameInSkillPath(skillPath.system.skillPath2, skillName);
            return { skill: skill.skill, path: 'skillPath2.' + skill.path };
        }
        if (this.findSkillWithNameInSkillPath(skillPath.system.skillPath3, skillName)) {
            let skill = this.findSkillWithNameInSkillPath(skillPath.system.skillPath3, skillName);
            return { skill: skill.skill, path: 'skillPath3.' + skill.path };
        }
    }

    findSkillWithNameInSkillPath(skillPath, skillName) {
        if (skillPath.skill1.skillName === skillName) {
            return { skill: skillPath.skill1, path: 'skill1' };
        }
        if (skillPath.skill2.skillName === skillName) {
            return { skill: skillPath.skill2, path: 'skill2' };
        }
        if (skillPath.skill3.skillName === skillName) {
            return { skill: skillPath.skill3, path: 'skill3' };
        }

        return null;
    }
}
