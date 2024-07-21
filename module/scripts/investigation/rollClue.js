import { getInteractActor } from "../helper.js";

const DialogV2 = foundry.applications.api.DialogV2

export async function rollClue(clueItem) {
    let actor = await getInteractActor()

    let availableSkills = clueItem.system.skillsUsed;

    let choosenSkill;

    if (availableSkills.length == 0) {
        return
    }

    if (availableSkills.length == 1) {
        choosenSkill = availableSkills[0]
    } else {
        let skills = availableSkills.reduce((acc, skill) => acc.concat([CONFIG.WITCHER.skillMap[skill]]), [])
        const dialogTemplate = await renderTemplate("systems/TheWitcherTRPG/templates/dialog/investigation/chooseEvidenceSkill.hbs", { skills: skills });


        choosenSkill = await DialogV2.wait({
            title: `${game.i18n.localize("WITCHER.Investigation.evidence.chooseSkill")}`,
            content: dialogTemplate,
            buttons: [
                {
                    action: "selectedSkill",
                    label: game.i18n.localize("WITCHER.Dialog.ButtonRoll"),
                    callback: (event, button, dialog) => button.form.elements.selectedSkill.value
                },
                {
                    action: "cancel",
                    label: game.i18n.localize("WITCHER.Button.Cancel"),
                }
            ]
        })
    }

    actor.rollSkill(choosenSkill);
}