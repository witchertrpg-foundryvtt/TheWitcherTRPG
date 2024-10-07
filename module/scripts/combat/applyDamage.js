import { buttonDialog } from '../chat.js';
import { applyModifierToActor } from '../globalModifier/applyGlobalModifier.js';
import { getInteractActor } from '../helper.js';
import { applyStatusEffectToActor } from '../statusEffects/applyStatusEffect.js';

export function addDamageMessageContextOptions(html, options) {
    let canApplyDamage = li => li.find('.damage-message').length;
    options.push(
        {
            name: `${game.i18n.localize('WITCHER.Context.applyDmg')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            condition: canApplyDamage,
            callback: async li => {
                ApplyNormalDamage(
                    await getInteractActor(),
                    li.find('.dice-total')[0].innerText,
                    li[0].dataset.messageId
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
                    li.find('.dice-total')[0].innerText,
                    li[0].dataset.messageId
                );
            }
        }
    );
    return options;
}

async function ApplyNormalDamage(actor, totalDamage, messageId) {
    applyDamage(actor, totalDamage, messageId, 'hp');
}

async function ApplyNonLethalDamage(actor, totalDamage, messageId) {
    applyDamage(actor, totalDamage, messageId, 'sta');
}

async function createApplyDamageDialog(actor, damage) {
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

    const silverOptions = `
    <option></option>
    <option value="1d6">1d6</option>
    <option value="2d6">2d6</option>
    <option value="3d6">3d6</option>
    <option value="4d6">4d6</option>
    <option value="5d6">5d6</option>
    `;

    let location = damage.location;
    let damageTypeloc = `WITCHER.Armor.${damage.type}`;
    let content = `<label>${game.i18n.localize('WITCHER.Damage.damageType')}: <b>${game.i18n.localize(damageTypeloc)}</b></label> <br />
      <label>${game.i18n.localize('WITCHER.Damage.CurrentLocation')}: <b>${location.alias}</b></label> <br />
      <label>${game.i18n.localize('WITCHER.Damage.ChangeLocation')}: <select name="changeLocation">${locationOptions}</select></label> <br />`;

    if (actor.type == 'monster') {
        content += `<label>${game.i18n.localize('WITCHER.Damage.resistSilver')}: <input type="checkbox" name="resistNonSilver"></label><br />
                    <label>${game.i18n.localize('WITCHER.Damage.resistMeteorite')}: <input type="checkbox" name="resistNonMeteorite"></label><br />`;
    }

    content += `<label>${game.i18n.localize('WITCHER.Damage.isVulnerable')}: <input type="checkbox" name="vulnerable"></label><br />
    <label>${game.i18n.localize('WITCHER.Damage.oilDmg')}: <input type="checkbox" name="oilDmg"></label><br />
    <label>${game.i18n.localize('WITCHER.Damage.silverDmg')}: <select name="silverDmg">${silverOptions}</select></label><br />`;

    let cancel = true;
    let resistNonSilver = false;
    let resistNonMeteorite = false;
    let newLocation = false;
    let isVulnerable = false;
    let addOilDmg = false;
    let silverDmg;

    let dialogData = {
        buttons: [
            [
                `${game.i18n.localize('WITCHER.Button.Continue')}`,
                html => {
                    newLocation = html.find('[name=changeLocation]')[0].value;
                    resistNonSilver = html.find('[name=resistNonSilver]').prop('checked');
                    resistNonMeteorite = html.find('[name=resistNonMeteorite]').prop('checked');
                    isVulnerable = html.find('[name=vulnerable]').prop('checked');
                    addOilDmg = html.find('[name=oilDmg]').prop('checked');
                    silverDmg = html.find('[name=silverDmg]')[0].value;
                    cancel = false;
                }
            ]
        ],
        title: game.i18n.localize('WITCHER.Context.applyDmg'),
        content: content
    };

    await buttonDialog(dialogData);

    return {
        cancel,
        resistNonSilver,
        resistNonMeteorite,
        newLocation,
        isVulnerable,
        addOilDmg,
        silverDmg
    };
}

async function applyDamage(actor, totalDamage, messageId, derivedStat) {
    let damage = game.messages.get(messageId).getFlag('TheWitcherTRPG', 'damage');

    let infoTotalDmg = totalDamage;
    let location = damage.location;

    let dialogData = await createApplyDamageDialog(actor, damage);

    if (dialogData.cancel) {
        return;
    }

    if (dialogData.newLocation != 'Empty') {
        location = actor.getLocationObject(dialogData.newLocation);
    }

    if (dialogData.addOilDmg) {
        totalDamage = Number(totalDamage) + 5;
        infoTotalDmg += `+5[${game.i18n.localize('WITCHER.Damage.oil')}]`;
    }

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

    if (damage.damageProperties.damageToAllLocations) {
        applyDamageToAllLocations(actor, dialogData, damage, totalDamage, infoTotalDmg, derivedStat);
    } else {
        applyDamageToLocation(actor, dialogData, damage, totalDamage, infoTotalDmg, location, derivedStat);
    }

    damage.damageProperties.effects
        .filter(effect => effect.statusEffect)
        .filter(effect => effect.applied)
        .forEach(effect => applyStatusEffectToActor(actor.uuid, effect.statusEffect, damage.duration));

    if (damage.damageProperties.appliesGlobalModifierToDamaged) {
        damage.damageProperties.damagedGlobalModifiers.forEach(modifier => applyModifierToActor(actor.uuid, modifier));
    }
}

async function applyDamageToLocation(actor, dialogData, damage, totalDamage, infoTotalDmg, location, derivedStat) {
    let damageResult = await calculateDamageWithLocation(
        actor,
        dialogData,
        damage,
        totalDamage,
        infoTotalDmg,
        location
    );

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

    actor?.update({
        [`system.derivedStats.${derivedStat}.value`]:
            actor.system.derivedStats[derivedStat].value - Math.floor(damageResult.totalDamage)
    });
}

async function applyDamageToAllLocations(actor, dialogData, damage, totalDamage, infoTotalDmg, derivedStat) {
    let locations = actor.getAllLocations().map(location => actor.getLocationObject(location));

    let resultPromises = [];
    locations.forEach(location =>
        resultPromises.push(calculateDamageWithLocation(actor, dialogData, damage, totalDamage, infoTotalDmg, location))
    );

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

    actor?.update({
        [`system.derivedStats.${derivedStat}.value`]: actor.system.derivedStats[derivedStat].value - totalAppliedDamage
    });
}

async function calculateDamageWithLocation(actor, dialogData, damage, totalDamage, infoTotalDmg, location) {
    let damageProperties = damage.damageProperties;

    let locationArmor = getLocationArmor(actor, location, damageProperties);
    let armorSet = locationArmor.armorSet;
    let totalSP = locationArmor.totalSP;
    let displaySP = locationArmor.displaySP;

    if (damageProperties.improvedArmorPiercing) {
        totalSP = Math.ceil(totalSP / 2);
        displaySP = Math.ceil(displaySP / 2);
    }

    let silverDamage = 0;
    if (dialogData.silverDmg) {
        let silverRoll = await new Roll(dialogData.silverDmg).evaluate();
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

    if (totalDamage <= 0 && silverDamage <= 0) {
        return {
            blockedBySp: true,
            totalDamage: 0,
            infoTotalDmg,
            displaySP,
            infoAfterSPReduction,
            location
        };
    }

    totalDamage = Math.floor(location.locationFormula * totalDamage);
    silverDamage = Math.floor(location.locationFormula * silverDamage);
    let infoAfterLocation = totalDamage;
    if (silverDamage) {
        infoAfterLocation += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
    }

    totalDamage = calculateResistances(totalDamage, damage, armorSet);

    if (dialogData.resistNonSilver || dialogData.resistNonMeteorite) {
        totalDamage = Math.floor(0.5 * totalDamage);
    }

    let infoAfterResistance = totalDamage;
    if (silverDamage) {
        totalDamage += silverDamage;
        infoAfterResistance += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
    }

    if (dialogData.isVulnerable) {
        totalDamage *= 2;
    }

    let spDamage = await applySpDamage(location, damageProperties, armorSet);

    return {
        totalDamage,
        infoTotalDmg,
        displaySP,
        damageProperties,
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

function getLocationArmor(actor, location, damageProperties) {
    let armors = actor.getList('armor').filter(a => a.system.equipped);

    let headArmors = armors.filter(h => h.system.location == 'Head' || h.system.location == 'FullCover');
    let torsoArmors = armors.filter(t => t.system.location == 'Torso' || t.system.location == 'FullCover');
    let legArmors = armors.filter(l => l.system.location == 'Leg' || l.system.location == 'FullCover');

    let armorSet;
    let totalSP = 0;
    let displaySP = '';

    switch (location.name) {
        case 'head':
            armorSet = getArmors(headArmors);
            totalSP += actor.system.armorHead ?? 0;
            displaySP += actor.system.armorHead > 0 ? actor.system.armorHead + ' + ' : '';
            break;
        case 'torso':
        case 'rightArm':
        case 'leftArm':
            armorSet = getArmors(torsoArmors);
            totalSP += actor.system.armorUpper ?? 0;
            displaySP += actor.system.armorUpper > 0 ? actor.system.armorUpper + ' + ' : '';
            break;
        case 'rightLeg':
        case 'leftLeg':
            armorSet = getArmors(legArmors);
            totalSP += actor.system.armorLower ?? 0;
            displaySP += actor.system.armorLower > 0 ? actor.system.armorLower + ' + ' : '';
            break;
        case 'tailWing':
            armorSet = getArmors([]);
            totalSP += actor.system.armorTailWing ?? 0;
            displaySP += actor.system.armorTailWing > 0 ? actor.system.armorTailWing + ' + ' : '';
            break;
    }

    if (damageProperties.bypassesNaturalArmor) {
        //reset SP when bypassing monster natural armor
        totalSP = 0;
        displaySP = '';
    }

    displaySP += getArmorSp(armorSet, location.name + 'Stopping', damageProperties).displaySP;
    totalSP += getArmorSp(armorSet, location.name + 'Stopping', damageProperties).totalSP;

    if (!displaySP) {
        displaySP = '0';
    }

    return {
        armorSet,
        totalSP,
        displaySP
    };
}

function getArmors(armors) {
    let lightCount = 0,
        mediumCount = 0,
        heavyCount = 0;
    let lightArmor, mediumArmor, heavyArmor, naturalArmor;
    armors.forEach(item => {
        if (item.system.type == 'Light') {
            lightCount++;
            lightArmor = item;
        }
        if (item.system.type == 'Medium') {
            mediumCount++;
            mediumArmor = item;
        }
        if (item.system.type == 'Heavy') {
            heavyCount++;
            heavyArmor = item;
        }
        if (item.system.type == 'Natural') {
            naturalArmor = item;
        }
    });

    if (lightCount > 1 || mediumCount > 1 || heavyCount > 1) {
        ui.notifications.error(game.i18n.localize('WITCHER.Armor.tooMuch'));
        return;
    }

    return {
        lightArmor: lightArmor,
        mediumArmor: mediumArmor,
        heavyArmor: heavyArmor,
        naturalArmor: naturalArmor
    };
}

function getArmorSp(armorSet, location, damageProperties) {
    return getStackedArmorSp(
        armorSet['lightArmor']?.system[location],
        armorSet['mediumArmor']?.system[location],
        armorSet['heavyArmor']?.system[location],
        armorSet['naturalArmor']?.system[location],
        damageProperties
    );
}

function getStackedArmorSp(lightArmorSP, mediumArmorSP, heavyArmorSP, naturalArmorSP, damageProperties) {
    let totalSP = 0;
    let displaySP = '';

    if (heavyArmorSP && !damageProperties.bypassesWornArmor) {
        totalSP = heavyArmorSP;
        displaySP = heavyArmorSP;
    }

    if (mediumArmorSP && !damageProperties.bypassesWornArmor) {
        if (heavyArmorSP) {
            let diff = getArmorDiffBonus(heavyArmorSP, mediumArmorSP);
            totalSP = Number(totalSP) + Number(diff);
            displaySP += ' +' + diff;
        } else {
            displaySP = mediumArmorSP;
            totalSP = mediumArmorSP;
        }
    }

    if (lightArmorSP && !damageProperties.bypassesWornArmor) {
        if (mediumArmorSP) {
            let diff = getArmorDiffBonus(mediumArmorSP, lightArmorSP);
            totalSP = Number(totalSP) + Number(diff);
            displaySP += ` +${diff}[${game.i18n.localize('WITCHER.Armor.LayerBonus')}]`;
        } else if (heavyArmorSP) {
            let diff = getArmorDiffBonus(heavyArmorSP, lightArmorSP);
            totalSP = Number(totalSP) + Number(diff);
            displaySP += ` +${diff}[${game.i18n.localize('WITCHER.Armor.LayerBonus')}]`;
        } else {
            totalSP = lightArmorSP;
            displaySP = lightArmorSP;
        }
    }

    if (naturalArmorSP && !damageProperties.bypassesNaturalArmor) {
        totalSP += naturalArmorSP;
        displaySP += ` +${naturalArmorSP} [${game.i18n.localize('WITCHER.Armor.Natural')}]`;
    }

    return {
        displaySP,
        totalSP
    };
}

function getArmorDiffBonus(OverArmor, UnderArmor) {
    let diff = OverArmor - UnderArmor;

    if (UnderArmor <= 0 || OverArmor <= 0) {
        return 0;
    }

    if (diff < 0) {
        diff *= -1;
    }

    if (diff > 20) {
        return 0;
    } else if (diff > 15) {
        return 2;
    } else if (diff > 9) {
        return 3;
    } else if (diff > 5) {
        return 4;
    } else if (diff >= 0) {
        return 5;
    }
    return 0;
}

function calculateResistances(totalDamage, damage, armorSet) {
    let damageProperties = damage.damageProperties;
    if (damageProperties.armorPiercing || damageProperties.improvedArmorPiercing) {
        return totalDamage;
    }

    if (
        (armorSet['lightArmor']?.system[damage.type] ||
            armorSet['mediumArmor']?.system[damage.type] ||
            armorSet['heavyArmor']?.system[damage.type]) &&
        !damageProperties.bypassesWornArmor
    ) {
        return Math.floor(0.5 * totalDamage);
    }

    if (armorSet['naturalArmor']?.system[damage.type] && !damageProperties.bypassesNaturalArmor) {
        return Math.floor(0.5 * totalDamage);
    }

    return totalDamage;
}

async function applySpDamage(location, damageProperties, armorSet) {
    if (damageProperties.bypassesWornArmor) {
        //damage bypasses armor so no SP damage
        return 0;
    }

    let spDamage =
        damageProperties.crushingForce || damageProperties.ablating
            ? Math.floor((await new Roll('1d6/2+1').evaluate()).total)
            : 1;

    if (damageProperties.crushingForce) {
        spDamage *= 2;
    }

    let lightArmorSP = armorSet['lightArmor']?.system[location.name + 'Stopping'] - spDamage;
    armorSet['lightArmor']?.update({ [`system.${location.name}Stopping`]: lightArmorSP > 0 ? lightArmorSP : 0 });

    let mediumArmorSP = armorSet['mediumArmor']?.system[location.name + 'Stopping'] - spDamage;
    armorSet['mediumArmor']?.update({ [`system.${location.name}Stopping`]: mediumArmorSP > 0 ? mediumArmorSP : 0 });

    let heavyArmorSP = armorSet['heavyArmor']?.system[location.name + 'Stopping'] - spDamage;
    armorSet['heavyArmor']?.update({ [`system.${location.name}Stopping`]: heavyArmorSP > 0 ? heavyArmorSP : 0 });

    return spDamage;
}

export { ApplyNormalDamage, ApplyNonLethalDamage };
