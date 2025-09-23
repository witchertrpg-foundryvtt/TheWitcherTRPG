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
        html = $(html);
        let thisActor = this.actor;
        let skillMap = this.skillMap;

        html.find('.profession-roll').on('click', event => thisActor._onProfessionRoll(event));
        html.find('.skill-display').on('click', this._onSkillDisplay.bind(this));

        //int skills
        html.find('#awareness-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.awareness);
        });
        html.find('#business-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.business);
        });
        html.find('#deduction-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.deduction);
        });
        html.find('#education-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.education);
        });
        html.find('#commonsp-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.commonsp);
        });
        html.find('#eldersp-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.eldersp);
        });
        html.find('#dwarven-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.dwarven);
        });
        html.find('#monster-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.monster);
        });
        html.find('#socialetq-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.socialetq);
        });
        html.find('#streetwise-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.streetwise);
        });
        html.find('#tactics-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.tactics);
        });
        html.find('#teaching-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.teaching);
        });
        html.find('#wilderness-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.wilderness);
        });
        //ref skills
        html.find('#brawling-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.brawling);
        });
        html.find('#dodge-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.dodge);
        });
        html.find('#melee-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.melee);
        });
        html.find('#riding-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.riding);
        });
        html.find('#sailing-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.sailing);
        });
        html.find('#smallblades-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.smallblades);
        });
        html.find('#staffspear-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.staffspear);
        });
        html.find('#swordsmanship-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.swordsmanship);
        });
        //dex skills
        html.find('#archery-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.archery);
        });
        html.find('#athletics-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.athletics);
        });
        html.find('#crossbow-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.crossbow);
        });
        html.find('#sleight-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.sleight);
        });
        html.find('#stealth-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.stealth);
        });
        //body skills
        html.find('#physique-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.physique);
        });
        html.find('#endurance-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.endurance);
        });
        //emp skills
        html.find('#charisma-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.charisma);
        });
        html.find('#deceit-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.deceit);
        });
        html.find('#finearts-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.finearts);
        });
        html.find('#gambling-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.gambling);
        });
        html.find('#grooming-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.grooming);
        });
        html.find('#perception-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.perception);
        });
        html.find('#leadership-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.leadership);
        });
        html.find('#persuasion-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.persuasion);
        });
        html.find('#performance-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.performance);
        });
        html.find('#seduction-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.seduction);
        });
        //cra skills
        html.find('#alchemy-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.alchemy);
        });
        html.find('#crafting-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.crafting);
        });
        html.find('#disguise-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.disguise);
        });
        html.find('#firstaid-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.firstaid);
        });
        html.find('#forgery-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.forgery);
        });
        html.find('#picklock-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.picklock);
        });
        html.find('#trapcraft-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.trapcraft);
        });
        //will skills
        html.find('#courage-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.courage);
        });
        html.find('#hexweave-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.hexweave);
        });
        html.find('#intimidation-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.intimidation);
        });
        html.find('#spellcast-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.spellcast);
        });
        html.find('#resistmagic-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.resistmagic);
        });
        html.find('#resistcoerc-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.resistcoerc);
        });
        html.find('#ritcraft-rollable').on('click', function () {
            thisActor.rollSkillCheck(skillMap.ritcraft);
        });
    }
};
