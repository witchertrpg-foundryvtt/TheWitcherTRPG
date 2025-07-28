import WitcherConfigurationSheet from './WitcherConfigurationSheet.js';

export default class WitcherProfessionConfigurationSheet extends WitcherConfigurationSheet {
    /** @override */
    static DEFAULT_OPTIONS = {
        actions: {
            addEffectDamageProperties: WitcherProfessionConfigurationSheet._onAddEffectDamageProperties,
            editEffect: WitcherProfessionConfigurationSheet._onEditEffectDamageProperties,
            removeEffect: WitcherProfessionConfigurationSheet._oRemoveEffectDamageProperties
        }
    };

    static PARTS = {
        ...super.PARTS,
        skillPath1: {
            template:
                'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/profession/skillPathPart.hbs',
            scrollable: ['']
        },
        skillPath2: {
            template:
                'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/profession/skillPathPart.hbs',
            scrollable: ['']
        },
        skillPath3: {
            template:
                'systems/TheWitcherTRPG/templates/sheets/item/configuration/partials/profession/skillPathPart.hbs',
            scrollable: ['']
        }
    };

    static TABS = {
        primary: {
            tabs: [
                { id: 'general' },
                { id: 'skillPath1' },
                { id: 'skillPath2' },
                { id: 'skillPath3' },
                { id: 'activeEffects' }
            ],
            initial: 'general',
            labelPrefix: 'WITCHER.Item.Settings'
        }
    };

    /** @inheritdoc */
    _prepareTabs(group) {
        const tabs = super._prepareTabs(group);
        if (group === 'primary') {
            const system = this.item.system;
            tabs.skillPath1.label = this.item.system.skillPath1.pathName;
            tabs.skillPath2.label = this.item.system.skillPath2.pathName;
            tabs.skillPath3.label = this.item.system.skillPath3.pathName;
        }

        return tabs;
    }

    async _preparePartContext(partId, context, options) {
        let partContext = {
            config: CONFIG.WITCHER,
            tab: context.tabs[partId],
            partId: partId
        };

        if (partId === 'skillPath1') {
            return {
                ...partContext,
                skillPathFields: context.systemFields.skillPath1,
                skillPath: context.item.system.skillPath1
            };
        }
        if (partId === 'skillPath2') {
            return {
                ...partContext,
                skillPathFields: context.systemFields.skillPath2,
                skillPath: context.item.system.skillPath2
            };
        }
        if (partId === 'skillPath3') {
            return {
                ...partContext,
                skillPathFields: context.systemFields.skillPath3,
                skillPath: context.item.system.skillPath3
            };
        }

        return context;
    }

    _onChangeForm(formConfig, event) {
        super._onChangeForm(formConfig, event);
        if (event.target.dataset.action === 'editEffectDamageProperties') {
            this._onEditEffectDamageProperties(event, event.target);
        }
    }

    static async _onAddEffectDamageProperties(event, element) {
        event.preventDefault();
        let skillName = element.dataset.target;

        let skillObject = this.findSkillWithName(skillName);

        let newList = skillObject.skill.skillAttack.damageProperties.effects ?? [];
        newList.push({ percentage: 0 });
        this.item.update({ [`system.${skillObject.path}.skillAttack.damageProperties.effects`]: newList });
    }

    static async _onEditEffectDamageProperties(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let effectId = element.closest('.list-item').dataset.id;

        let field = element.dataset.field;
        let value = element.value;

        if (value == 'on') {
            value = element.checked;
        }

        let skillName = element.closest('.list-item').dataset.target;
        let skillObject = this.findSkillWithName(skillName);

        let effects = skillObject.skill.skillAttack.damageProperties.effects;
        let objIndex = effects.findIndex(obj => obj.id == effectId);
        effects[objIndex][field] = value;

        this.item.update({ [`system.${skillObject.path}.skillAttack.damageProperties.effects`]: effects });
    }

    static async _oRemoveEffectDamageProperties(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let effectId = element.closest('.list-item').dataset.id;

        let skillName = element.closest('.list-item').dataset.target;
        let skillObject = this.findSkillWithName(skillName);

        let newList = skillObject.skill.skillAttack.damageProperties.effects.filter(effect => effect.id !== effectId);
        this.item.update({ [`system.${skillObject.path}.skillAttack.damageProperties.effects`]: newList });
    }

    static findSkillWithName(skillName) {
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

    static findSkillWithNameInSkillPath(skillPath, skillName) {
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
