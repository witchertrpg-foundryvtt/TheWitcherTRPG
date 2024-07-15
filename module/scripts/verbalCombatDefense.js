import { extendedRoll } from "./chat.js";
import { getInteractActor } from "./helper.js";
import { RollConfig } from "./rollConfig.js";
import { addAllModifiers } from "./witcher.js";

export function addVerbalCombatDefenseMessageContextOptions(html, options) {
    let canDefend = li => li.find(".verbal-combat-attack-message").length
    options.push(
        {
            name: `${game.i18n.localize("WITCHER.Context.Defense")}`,
            icon: '<i class="fas fa-shield-alt"></i>',
            condition: canDefend,
            callback: li => {
                executeDefense(
                    getInteractActor(),
                    li[0].dataset.messageId,
                    li.find(".dice-total")[0].innerText)
            }
        },
    );
    return options;
}

async function executeDefense(actor, messageId, totalAttack) {
    if (!actor) return;

    let message = game.messages.get(messageId)

    // let location = game.messages.get(messageId)?.getFlag('TheWitcherTRPG', 'damage').location
    const dialogTemplate = await renderTemplate("systems/TheWitcherTRPG/templates/dialog/verbal-combat-defense.hbs", { defenses: CONFIG.WITCHER.verbalCombat.Defences });

    new Dialog({
        title: `${game.i18n.localize("WITCHER.Dialog.DefenseTitle")}`,
        content: dialogTemplate,
        buttons: {
            t1: {
                label: `${game.i18n.localize("WITCHER.Dialog.ButtonRoll")}`,
                callback: executeDefenseCallback.bind(this, actor, totalAttack)
            },
            t2: {
                label: `${game.i18n.localize("WITCHER.Button.Cancel")}`,
            }
        }
    }).render(true)
}

async function executeDefenseCallback(actor, totalAttack, html) {
    let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

    let checkedBox = document.querySelector('input[name="verbalCombat"]:checked')
    if (!checkedBox) return;
    let verbal = checkedBox.value;

    let verbalCombat = CONFIG.WITCHER.verbalCombat.Defences[verbal]
    let vcName = verbalCombat.name;

    let vcStatName = verbalCombat.skill?.attribute.label ?? "WITCHER.Context.unavailable";
    let vcStat = verbalCombat.skill ? actor.system.stats[verbalCombat.skill.attribute.name]?.current : 0;

    let vcSkillName = verbalCombat.skill?.label ?? "WITCHER.Context.unavailable";
    let vcSkill = verbalCombat.skill ? actor.system.skills[verbalCombat.skill.attribute.name][verbalCombat.skill.name]?.value : 0

    let vcDmg = verbalCombat.baseDmg ? `${verbalCombat.baseDmg}+${actor.system.stats[verbalCombat.dmgStat.name].current}[${game.i18n.localize(verbalCombat.dmgStat?.label)}]` : game.i18n.localize("WITCHER.verbalCombat.None")
    if (verbal == "Counterargue") {
        vcDmg = `${game.i18n.localize("WITCHER.verbalCombat.CounterargueDmg")}`
    }

    let effect = verbalCombat.effect

    let rollFormula = `1d10`;

    if (verbalCombat.skill) {
        rollFormula += !displayRollDetails ? ` +${vcStat} +${vcSkill}` : ` +${vcStat}[${game.i18n.localize(vcStatName)}] +${vcSkill}[${game.i18n.localize(vcSkillName)}]`
        rollFormula = addAllModifiers(actor, verbalCombat.skill.name, rollFormula)
    }

    let customAtt = html.find("[name=customModifiers]")[0].value;
    if (customAtt < 0) {
        rollFormula += !displayRollDetails ? `${customAtt}` : `${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
    }
    if (customAtt > 0) {
        rollFormula += !displayRollDetails ? `+${customAtt}` : `+${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
    }

    let messageData = {
        speaker: ChatMessage.getSpeaker({ actor: actor })
    }
    messageData.flavor = `
            <div class="verbal-combat-attack-message">
              <h2>${game.i18n.localize("WITCHER.verbalCombat.Title")}: ${game.i18n.localize(vcName)}</h2>
              <b>${game.i18n.localize("WITCHER.Weapon.Damage")}</b>: ${vcDmg} <br />
              ${game.i18n.localize(effect)}
              <hr />
              </div>`
    messageData.flavor += vcDmg.includes("d") ? `<button class="vcDamage" > ${game.i18n.localize("WITCHER.table.Damage")}</button>` : ''

    let config = createRollConfig(actor, vcSkill, totalAttack)
    config.showCrit = true
    await extendedRoll(rollFormula, messageData, config, actor.createVerbalCombatFlags(verbalCombat, vcDmg))
}

function createRollConfig(actor, skill, totalAttack) {
    let config = new RollConfig()
    config.showResult = true;
    config.defence = true
    config.threshold = totalAttack
    config.thresholdDesc = skill.label
    config.flagsOnSuccess = actor.getDefenceSuccessFlags(skill)
    config.flagsOnFailure = actor.getDefenceFailFlags(skill)

    return config;
}