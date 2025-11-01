export let skillMixin = {
    calc_total_skills(context) {
        let totalSkills = 0;
        for (let element in context.system.skills) {
            for (let skill in context.system.skills[element]) {
                let skillLabel = game.i18n.localize(context.system.skills[element][skill].label);
                if (skillLabel?.includes('(2)')) {
                    totalSkills += context.system.skills[element][skill].value * 2;
                } else {
                    totalSkills += context.system.skills[element][skill].value;
                }
            }
        }
        return totalSkills;
    },

    _onSkillDisplay(event) {
        event.preventDefault();
        let section = event.currentTarget.closest('.skill');
        this.actor.update({
            [`system.pannels.${section.dataset.skilltype}IsOpen`]:
                !this.actor.system.pannels[section.dataset.skilltype + 'IsOpen']
        });
    },

    skillListener(html) {
        jQuery = $(html);
        let thisActor = this.actor;
        let skillMap = this.skillMap;

        jQuery.find('.profession-roll').on('click', event => thisActor._onProfessionRoll(event));
        jQuery.find('.skill-display').on('click', this._onSkillDisplay.bind(this));

        html.querySelectorAll('[data-action=rollSkill]').forEach(skill =>
            skill.addEventListener('click', event => thisActor.rollSkillCheck(skillMap[skill.dataset.skill]))
        );
    }
};
