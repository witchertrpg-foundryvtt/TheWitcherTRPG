import { rollSkillCheck } from "../../scripts/witcher.js";
import { extendedRoll } from "../../scripts/chat.js";
import { RollConfig } from "../../scripts/rollConfig.js";

export let skillMixin = {
  /** Do not delete. This method is here to give external modules the possibility to make skill rolls. */
  async _onSkillRoll(statNum, skillNum) {
    rollSkillCheck(this.actor, statNum, skillNum);
  },

  async _onProfessionRoll(event) {
    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
    let stat = event.currentTarget.closest(".profession-display").dataset.stat;
    let level = event.currentTarget.closest(".profession-display").dataset.level || 0;
    let name = event.currentTarget.closest(".profession-display").dataset.name;
    let effet = event.currentTarget.closest(".profession-display").dataset.effet;
    let statValue = this.actor.system.stats[stat].current;
    let statName = `WITCHER.St${stat.charAt(0).toUpperCase() + stat.slice(1)}`;

    let rollFormula = !displayRollDetails ? `1d10+${statValue}+${level}` : `1d10+${statValue}[${game.i18n.localize(statName)}]+${level}[${name}]`;
    new Dialog({
      title: `${game.i18n.localize("WITCHER.Dialog.profession.skill")}: ${name}`,
      content: `<label>${game.i18n.localize("WITCHER.Dialog.attackCustom")}: <input name="customModifiers" value=0></label>`,
      buttons: {
        continue: {
          label: game.i18n.localize("WITCHER.Button.Continue"),
          callback: async html => {
            let customAtt = html.find("[name=customModifiers]")[0].value;
            if (customAtt < 0) {
              rollFormula += !displayRollDetails ? `${customAtt}` : `${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
            }
            if (customAtt > 0) {
              rollFormula += !displayRollDetails ? `+${customAtt}` : `+${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
            }

            let messageData = {
              speaker: ChatMessage.getSpeaker({ actor: this.actor }),
              flavor: `<h2>${name}</h2>${effet}`
            }

            let config = new RollConfig()
            config.showCrit = true
            await extendedRoll(rollFormula, messageData, config)
          }
        }
      }
    }).render(true)
  },

  calc_total_skills_profession(context) {
    let totalSkills = 0;
    if (context.profession) {
      totalSkills += Number(context.profession.system.definingSkill.level);
      totalSkills += Number(context.profession.system.skillPath1.skill1.level) + Number(context.profession.system.skillPath1.skill2.level) + Number(context.profession.system.skillPath1.skill3.level)
      totalSkills += Number(context.profession.system.skillPath2.skill1.level) + Number(context.profession.system.skillPath2.skill2.level) + Number(context.profession.system.skillPath2.skill3.level)
      totalSkills += Number(context.profession.system.skillPath3.skill1.level) + Number(context.profession.system.skillPath3.skill2.level) + Number(context.profession.system.skillPath3.skill3.level)
    }
    return totalSkills;
  },

  calc_total_skills(context) {
    let totalSkills = 0;
    for (let element in context.system.skills) {
      for (let skill in context.system.skills[element]) {
        let skillLabel = game.i18n.localize(context.system.skills[element][skill].label)
        if (skillLabel?.includes("(2)")) {
          totalSkills += context.system.skills[element][skill].value * 2;
        }
        else {
          totalSkills += context.system.skills[element][skill].value;
        }
      }
    }
    return totalSkills;
  },

  _onSkillDisplay(event) {
    event.preventDefault();
    let section = event.currentTarget.closest(".skill");
    this.actor.update({ [`system.pannels.${section.dataset.skilltype}IsOpen`]: !this.actor.system.pannels[section.dataset.skilltype + 'IsOpen'] });
  },


  skillListener(html) {
    let thisActor = this.actor;
    let skillMap = this.skillMap;

    html.find(".profession-roll").on("click", this._onProfessionRoll.bind(this));
    html.find(".skill-display").on("click", this._onSkillDisplay.bind(this));

    //int skills
    html.find("#awareness-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.awareness) });
    html.find("#business-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.business) });
    html.find("#deduction-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.deduction) });
    html.find("#education-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.education) });
    html.find("#commonsp-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.commonsp) });
    html.find("#eldersp-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.eldersp) });
    html.find("#dwarven-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.dwarven) });
    html.find("#monster-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.monster) });
    html.find("#socialetq-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.socialetq) });
    html.find("#streetwise-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.streetwise) });
    html.find("#tactics-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.tactics) });
    html.find("#teaching-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.teaching) });
    html.find("#wilderness-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.wilderness) });
    //ref skills
    html.find("#brawling-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.brawling) });
    html.find("#dodge-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.dodge) });
    html.find("#melee-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.melee) });
    html.find("#riding-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.riding) });
    html.find("#sailing-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.sailing) });
    html.find("#smallblades-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.smallblades) });
    html.find("#staffspear-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.staffspear) });
    html.find("#swordsmanship-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.swordsmanship) });
    //dex skills
    html.find("#archery-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.archery) });
    html.find("#athletics-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.athletics) });
    html.find("#crossbow-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.crossbow) });
    html.find("#sleight-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.sleight) });
    html.find("#stealth-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.stealth) });
    //body skills
    html.find("#physique-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.physique) });
    html.find("#endurance-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.endurance) });
    //emp skills
    html.find("#charisma-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.charisma) });
    html.find("#deceit-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.deceit) });
    html.find("#finearts-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.finearts) });
    html.find("#gambling-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.gambling) });
    html.find("#grooming-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.grooming) });
    html.find("#perception-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.perception) });
    html.find("#leadership-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.leadership) });
    html.find("#persuasion-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.persuasion) });
    html.find("#performance-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.performance) });
    html.find("#seduction-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.seduction) });
    //cra skills
    html.find("#alchemy-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.alchemy) });
    html.find("#crafting-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.crafting) });
    html.find("#disguise-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.disguise) });
    html.find("#firstaid-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.firstaid) });
    html.find("#forgery-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.forgery) });
    html.find("#picklock-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.picklock) });
    html.find("#trapcraft-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.trapcraft) });
    //will skills
    html.find("#courage-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.courage) });
    html.find("#hexweave-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.hexweave) });
    html.find("#intimidation-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.intimidation) });
    html.find("#spellcast-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.spellcast) });
    html.find("#resistmagic-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.resistmagic) });
    html.find("#resistcoerc-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.resistcoerc) });
    html.find("#ritcraft-rollable").on("click", function () { rollSkillCheck(thisActor, skillMap.ritcraft) });
  }

}