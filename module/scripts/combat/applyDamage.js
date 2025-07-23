import { applyActiveEffectToActorViaId } from '../activeEffects/applyActiveEffect.js';
import { getInteractActor } from '../helper.js';
import { applyStatusEffectToActor } from '../statusEffects/applyStatusEffect.js';

const DialogV2 = foundry.applications.api.DialogV2;

export function addDamageMessageContextOptions(html, options) {
    let canApplyDamage = li => li.querySelector('.damage-message');
    options.push(
        {
            name: `${game.i18n.localize('WITCHER.Context.applyDmg')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: canApplyDamage,
            callback: async li => {
                ApplyNormalDamage(
                    await getInteractActor(),
                    parseInt(li.querySelector('.dice-total').innerText),
                    li.dataset.messageId
                );
            }
        },
        {
            name: `${game.i18n.localize('WITCHER.Context.applyNonLethal')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: canApplyDamage,
            callback: async li => {
                ApplyNonLethalDamage(
                    await getInteractActor(),
                    parseInt(li.querySelector('.dice-total').innerText),
                    li.dataset.messageId
                );
            }
        }
    );
    return options;
}

async function ApplyNormalDamage(actor, totalDamage, messageId) {
    let damage = game.messages.get(messageId).getFlag('TheWitcherTRPG', 'damage');
    applyDamageFromMessage(actor, totalDamage, messageId, damage.properties.isNonLethal ? 'sta' : 'hp');
}

async function ApplyNonLethalDamage(actor, totalDamage, messageId) {
    applyDamageFromMessage(actor, totalDamage, messageId, 'sta');
}

async function createApplyDamageDialog(actor, damageObject) {
    const locationOptions = `
    <option value="Empty"></option>
    <option value="head"> ${game.i18n.localize('WITCHER.Dialog.attackHead')} </option>
    <option value="torso"> ${game.i18n.localize('WITCHER.Dialog.attackTorso')} </option>
    <option value="leftArm"> ${game.i18n.localize('WITCHER.Dialog.attackLArm')} </option>
    <option value="rightArm"> ${game.i18n.localize('WITCHER.Dialog.attackRArm')} </option>
    <option value="leftLeg"> ${game.i18n.localize('WITCHER.Dialog.attackLLeg')} </option>
    <option value="rightLeg"> ${game.i18n.localize('WITCHER.Dialog.attackRLeg')} </option>
    <option value="tailWing"> ${game.i18n.localize('WITCHER.Dialog.attackTail')} </option>
    `;

    let location = damageObject.location;
    let damageTypeloc = `WITCHER.DamageType.${damageObject.type}`;
    let content = `<label>${game.i18n.localize('WITCHER.Damage.damageType')}: <b>${game.i18n.localize(damageTypeloc)}</b></label> <br />
      <label>${game.i18n.localize('WITCHER.Damage.CurrentLocation')}: <b>${location.alias}</b></label> <br />
      <label>${game.i18n.localize('WITCHER.Damage.ChangeLocation')}: <select name="changeLocation">${locationOptions}</select></label> <br />`;

    if (actor.type == 'monster') {
        content += `<label>${game.i18n.localize('WITCHER.Damage.resistNonSilver')}: <input type="checkbox" name="resistNonSilver" ${actor.system.resistantNonSilver ? 'checked' : 'unchecked'}></label><br />
                    <label>${game.i18n.localize('WITCHER.Damage.resistNonMeteorite')}: <input type="checkbox" name="resistNonMeteorite" ${actor.system.resistantNonMeteorite ? 'checked' : 'unchecked'}></label><br />`;
    }

    content += `<label>${game.i18n.localize('WITCHER.Damage.isVulnerable')}: <input type="checkbox" name="vulnerable"></label><br />
    <label>${game.i18n.localize('WITCHER.Damage.oilDmg')}: <input type="checkbox" name="oilDmg"></label><br />`;

    let { newLocation, resistNonSilver, resistNonMeteorite, isVulnerable, addOilDmg } =
        await DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.Context.applyDmg')}` },
            content: content,
            modal: true,
            ok: {
                callback: (event, button, dialog) => {
                    return {
                        newLocation: button.form.elements.changeLocation?.value,
                        resistNonSilver: button.form.elements.resistNonSilver?.checked,
                        resistNonMeteorite: button.form.elements.resistNonMeteorite?.checked,
                        isVulnerable: button.form.elements.vulnerable?.checked,
                        addOilDmg: button.form.elements.oilDmg?.checked
                    };
                }
            }
        });

    return {
        resistNonSilver,
        resistNonMeteorite,
        newLocation,
        isVulnerable,
        addOilDmg
    };
}

async function applyDamageFromStatus(actor, totalDamage, damageObject, derivedStat) {
    await applyDamage(actor, null, totalDamage, damageObject, derivedStat, totalDamage);
}

async function applyDamageFromMessage(actor, totalDamage, messageId, derivedStat) {
    let damage = game.messages.get(messageId).getFlag('TheWitcherTRPG', 'damage');

    let infoTotalDmg = totalDamage;

    let dialogData = await createApplyDamageDialog(actor, damage);

    if (dialogData.newLocation != 'Empty') {
        damage.location = actor.getLocationObject(dialogData.newLocation);
    }

    if (dialogData.addOilDmg) {
        damage.properties.oilEffect = actor.system.category;
    }

    applyDamage(actor, dialogData, totalDamage, damage, derivedStat, infoTotalDmg);
}

async function applyDamage(actor, dialogData, totalDamage, damageObject, derivedStat, infoTotalDmg = '') {
    let shield = actor.system.derivedStats.shield.value;
    if (totalDamage < shield) {
        actor.update({ 'system.derivedStats.shield.value': shield - totalDamage });
        let messageContent = `${game.i18n.localize('WITCHER.Damage.initial')}: <span class="error-display">${infoTotalDmg}</span><br />
                                ${game.i18n.localize('WITCHER.Damage.shield')}: <span class="error-display">${shield}</span><br />
                                ${game.i18n.localize('WITCHER.Damage.ToMuchShield')}
                                `;
        let messageData = {
            content: messageContent,
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flags: actor.getNoDamageFlags()
        };
        ChatMessage.applyRollMode(messageData, game.settings.get('core', 'rollMode'));
        ChatMessage.create(messageData);
        return;
    } else {
        actor.update({ 'system.derivedStats.shield.value': 0 });
        totalDamage -= shield;
    }

    if (actor.system.category && damageObject.properties?.oilEffect === actor.system.category) {
        totalDamage += 5;
        infoTotalDmg += `+5[${game.i18n.localize('WITCHER.Damage.oil')}]`;
    }

    if (damageObject.properties.damageToAllLocations) {
        await applyDamageToAllLocations(actor, dialogData, damageObject, totalDamage, infoTotalDmg, derivedStat);
    } else {
        await applyDamageToLocation(actor, dialogData, damageObject, totalDamage, infoTotalDmg, derivedStat);
    }

    damageObject.properties.effects
        ?.filter(effect => effect.statusEffect)
        .filter(effect => effect.applied)
        .forEach(effect => applyStatusEffectToActor(actor.uuid, effect.statusEffect, damageObject.duration));

    if (damageObject.itemUuid) {
        applyActiveEffectToActorViaId(actor.uuid, damageObject.itemUuid, 'applyOnDamage', damageObject.duration);
    }
}

async function applyDamageToLocation(actor, dialogData, damageObject, totalDamage, infoTotalDmg, derivedStat) {
    let damageResult = await calculateDamageWithLocation(actor, dialogData, damageObject, totalDamage, infoTotalDmg);

    if (damageResult.blockedBySp) {
        createDamageBlockedBySp(
            actor,
            damageResult.infoTotalDmg,
            damageResult.displaySP,
            damageResult.infoAfterSPReduction
        );
        return;
    }

    createResultMessage(actor, damageResult);

    await actor?.update({
        [`system.derivedStats.${derivedStat}.value`]:
            actor.system.derivedStats[derivedStat].value - Math.floor(damageResult.totalDamage)
    });
}

async function applyDamageToAllLocations(actor, dialogData, damage, totalDamage, infoTotalDmg, derivedStat) {
    let locations = actor.getAllLocations().map(location => actor.getLocationObject(location));

    let resultPromises = [];
    locations.forEach(location => {
        damage.location = location;

        resultPromises.push(calculateDamageWithLocation(actor, dialogData, damage, totalDamage, infoTotalDmg));
    });

    let results = await Promise.all(resultPromises);

    let totalAppliedDamage = results.reduce((acc, result) => acc + Math.floor(result.totalDamage), 0);

    const messageTemplate = 'systems/TheWitcherTRPG/templates/chat/damage/damageToAllLocations.hbs';
    const templateContext = {
        results,
        totalAppliedDamage
    };

    const content = await renderTemplate(messageTemplate, templateContext);
    const chatData = {
        content: content,
        type: CONST.CHAT_MESSAGE_STYLES.OTHER
    };

    ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));
    let message = await ChatMessage.create(chatData);

    await actor?.update({
        [`system.derivedStats.${derivedStat}.value`]: actor.system.derivedStats[derivedStat].value - totalAppliedDamage
    });
}

async function calculateDamageWithLocation(actor, dialogData, damage, totalDamage, infoTotalDmg) {
    let properties = damage.properties;
    let location = damage.location;

    let locationArmor = actor.getLocationArmor(location, properties);
    let armorSet = locationArmor.armorSet;
    let totalSP = locationArmor.totalSP;
    let displaySP = locationArmor.displaySP;

    if (properties.improvedArmorPiercing) {
        totalSP = Math.ceil(totalSP / 2);
        displaySP = Math.ceil(displaySP / 2);
    }

    let silverDamage = 0;
    if (properties?.silverDamage && dialogData?.resistNonSilver) {
        let multi = damage.strike === 'strong' ? '*2' : '';
        let silverRoll = await new Roll(damage.properties.silverDamage + multi).evaluate();
        silverDamage = silverRoll.total;
        infoTotalDmg += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
    }

    totalDamage -= totalSP < 0 ? 0 : totalSP;
    if (totalDamage < 0) {
        silverDamage = silverDamage + totalDamage > 0 ? silverDamage + totalDamage : 0;
    }

    let infoAfterSPReduction = totalDamage < 0 ? 0 : totalDamage;
    if (silverDamage) {
        infoAfterSPReduction += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
    }

    let spDamage = await actor.applyAlwaysSpDamage(location, properties, armorSet);

    if (totalDamage <= 0 && silverDamage <= 0) {
        return {
            blockedBySp: true,
            totalDamage: 0,
            infoTotalDmg,
            displaySP,
            infoAfterSPReduction,
            location,
            spDamage
        };
    }

    let flatDamageMod = actor.getFlatDamageMod(damage);

    totalDamage = Math.max(Math.floor(location.locationFormula * totalDamage), 0);
    silverDamage = Math.max(Math.floor(location.locationFormula * silverDamage), 0);
    let infoAfterLocation = totalDamage;
    if (flatDamageMod) {
        infoAfterLocation += `+${location.locationFormula * flatDamageMod}[${game.i18n.localize('WITCHER.Damage.activeEffect')}]`;
    }

    if (silverDamage) {
        infoAfterLocation += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
    }

    totalDamage = actor.calculateResistances(totalDamage, damage, armorSet);

    let damageTypeConfig = CONFIG.WITCHER.damageTypes.find(type => type.value === damage.type);
    if (
        (dialogData?.resistNonSilver && !properties?.silverDamage && !damageTypeConfig.likeSilver) ||
        (dialogData?.resistNonMeteorite && !properties?.isMeteorite && !damageTypeConfig.likeMeteorite)
    ) {
        totalDamage = Math.floor(0.5 * totalDamage);
    }

    let infoAfterResistance = totalDamage;
    if (silverDamage) {
        totalDamage += silverDamage;
        infoAfterResistance += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
    }

    if (dialogData?.isVulnerable) {
        totalDamage *= 2;
    }

    spDamage += await actor.applySpDamage(location, properties, armorSet);

    return {
        totalDamage,
        infoTotalDmg,
        displaySP,
        properties,
        infoAfterSPReduction,
        infoAfterLocation,
        infoAfterResistance,
        totalDamage,
        spDamage,
        location
    };
}

async function createDamageBlockedBySp(actor, infoTotalDmg, displaySP, infoAfterSPReduction) {
    let messageContent = `${game.i18n.localize('WITCHER.Damage.initial')}: <span class="error-display">${infoTotalDmg}</span><br />
        ${game.i18n.localize('WITCHER.Damage.totalSP')}: <span class="error-display">${displaySP}</span><br />
        ${game.i18n.localize('WITCHER.Damage.afterSPReduct')} <span class="error-display">${infoAfterSPReduction}</span><br /><br />
        ${game.i18n.localize('WITCHER.Damage.NotEnough')}
        `;

    let messageData = {
        content: messageContent,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flags: actor.getNoDamageFlags()
    };

    let rollResult = await new Roll('1').evaluate();
    ChatMessage.applyRollMode(messageData, game.settings.get('core', 'rollMode'));
    rollResult.toMessage(messageData);
}

async function createResultMessage(actor, damageResult) {
    const messageTemplate = 'systems/TheWitcherTRPG/templates/chat/damage/damageToLocation.hbs';

    const content = await renderTemplate(messageTemplate, damageResult);
    const chatData = {
        content: content,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flags: actor.getDamageFlags(),
        type: CONST.CHAT_MESSAGE_STYLES.OTHER
    };

    ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));
    ChatMessage.create(chatData);
}

export { ApplyNormalDamage, ApplyNonLethalDamage, applyDamageFromStatus, applyDamage };
