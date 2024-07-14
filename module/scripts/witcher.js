import { extendedRoll } from "./chat.js";
import { RollConfig } from "./rollConfig.js";

export function getRandomInt(max) {
	return Math.floor(Math.random() * (max + 1)) + 1;
}

/*
On any change to the Stats, the Derived Stats need to be updated appropriately. The base = Will+Body/2. HP and Stamina = base * 5.
Recovery and Stun = base. Stun can be a maximum of 10. Encumbrance = Body*10. Run = Speed*3. Leap = Run/5. Punch and Kick bonuses are determined 
with the Hand to Hand Table, page 48 of Witcher TRPG Handbook.

@param {Actor} actor - The actor passed in from actor-sheet.js to have its properties updated
*/
function updateDerived(actor) {
	const thisActor = actor;
	const stats = thisActor.system.stats;
	const base = Math.floor((stats.body.current + stats.will.current) / 2);
	const baseMax = Math.floor((stats.body.max + stats.will.max) / 2);
	const meleeBonus = Math.ceil((stats.body.current - 6) / 2) * 2;

	let intTotalModifiers = getAllModifier(thisActor, "int").totalModifiers;
	let refTotalModifiers = getAllModifier(thisActor, "ref").totalModifiers;
	let dexTotalModifiers = getAllModifier(thisActor, "dex").totalModifiers;
	let bodyTotalModifiers = getAllModifier(thisActor, "body").totalModifiers;
	let spdTotalModifiers = getAllModifier(thisActor, "spd").totalModifiers;
	let empTotalModifiers = getAllModifier(thisActor, "emp").totalModifiers;
	let craTotalModifiers = getAllModifier(thisActor, "cra").totalModifiers;
	let willTotalModifiers = getAllModifier(thisActor, "will").totalModifiers;
	let luckTotalModifiers = getAllModifier(thisActor, "luck").totalModifiers;
	let intDivider = getAllModifier(thisActor, "int").totalDivider;
	let refDivider = getAllModifier(thisActor, "ref").totalDivider;
	let dexDivider = getAllModifier(thisActor, "dex").totalDivider;
	let bodyDivider = getAllModifier(thisActor, "body").totalDivider;
	let spdDivider = getAllModifier(thisActor, "spd").totalDivider;
	let empDivider = getAllModifier(thisActor, "emp").totalDivider;
	let craDivider = getAllModifier(thisActor, "cra").totalDivider;
	let willDivider = getAllModifier(thisActor, "will").totalDivider;
	let luckDivider = getAllModifier(thisActor, "luck").totalDivider;
	thisActor.system.stats.int.modifiers.forEach(item => intTotalModifiers += Number(item.value));
	thisActor.system.stats.ref.modifiers.forEach(item => refTotalModifiers += Number(item.value));
	thisActor.system.stats.dex.modifiers.forEach(item => dexTotalModifiers += Number(item.value));
	thisActor.system.stats.body.modifiers.forEach(item => bodyTotalModifiers += Number(item.value));
	thisActor.system.stats.spd.modifiers.forEach(item => spdTotalModifiers += Number(item.value));
	thisActor.system.stats.emp.modifiers.forEach(item => empTotalModifiers += Number(item.value));
	thisActor.system.stats.cra.modifiers.forEach(item => craTotalModifiers += Number(item.value));
	thisActor.system.stats.will.modifiers.forEach(item => willTotalModifiers += Number(item.value));
	thisActor.system.stats.luck.modifiers.forEach(item => luckTotalModifiers += Number(item.value));

	let stunTotalModifiers = getAllModifier(thisActor, "stun").totalModifiers;;
	let runTotalModifiers = getAllModifier(thisActor, "run").totalModifiers;
	let leapTotalModifiers = getAllModifier(thisActor, "leap").totalModifiers;
	let encTotalModifiers = getAllModifier(thisActor, "enc").totalModifiers;
	let recTotalModifiers = getAllModifier(thisActor, "rec").totalModifiers;
	let wtTotalModifiers = getAllModifier(thisActor, "woundTreshold").totalModifiers;
	let stunDivider = getAllModifier(thisActor, "stun").totalDivider;
	let runDivider = getAllModifier(thisActor, "run").totalDivider;
	let leapDivider = getAllModifier(thisActor, "leap").totalDivider;
	let encDivider = getAllModifier(thisActor, "enc").totalDivider;
	let recDivider = getAllModifier(thisActor, "rec").totalDivider;
	let wtDivider = getAllModifier(thisActor, "woundTreshold").totalDivider;
	thisActor.system.coreStats.stun.modifiers.forEach(item => stunTotalModifiers += Number(item.value));
	thisActor.system.coreStats.run.modifiers.forEach(item => runTotalModifiers += Number(item.value));
	thisActor.system.coreStats.leap.modifiers.forEach(item => leapTotalModifiers += Number(item.value));
	thisActor.system.coreStats.enc.modifiers.forEach(item => encTotalModifiers += Number(item.value));
	thisActor.system.coreStats.rec.modifiers.forEach(item => recTotalModifiers += Number(item.value));
	thisActor.system.coreStats.woundTreshold.modifiers.forEach(item => wtTotalModifiers += Number(item.value));

	let curentEncumbrance = (thisActor.system.stats.body.max + bodyTotalModifiers) * 10 + encTotalModifiers
	var totalWeights = thisActor.getTotalWeight()
	let encDiff = 0
	if (curentEncumbrance < totalWeights) {
		encDiff = Math.ceil((totalWeights - curentEncumbrance) / 5)
	}
	let armorEnc = getArmorEcumbrance(thisActor)

	let curInt = Math.floor((thisActor.system.stats.int.max + intTotalModifiers) / intDivider);
	let curRef = Math.floor((thisActor.system.stats.ref.max + refTotalModifiers - armorEnc - encDiff) / refDivider);
	let curDex = Math.floor((thisActor.system.stats.dex.max + dexTotalModifiers - armorEnc - encDiff) / dexDivider);
	let curBody = Math.floor((thisActor.system.stats.body.max + bodyTotalModifiers) / bodyDivider);
	let curSpd = Math.floor((thisActor.system.stats.spd.max + spdTotalModifiers - encDiff) / spdDivider);
	let curEmp = Math.floor((thisActor.system.stats.emp.max + empTotalModifiers) / empDivider);
	let curCra = Math.floor((thisActor.system.stats.cra.max + craTotalModifiers) / craDivider);
	let curWill = Math.floor((thisActor.system.stats.will.max + willTotalModifiers) / willDivider);
	let curLuck = Math.floor((thisActor.system.stats.luck.max + luckTotalModifiers) / luckDivider);
	let isDead = false;
	let isWounded = false;
	let HPvalue = thisActor.system.derivedStats.hp.value;
	if (HPvalue <= 0) {
		isDead = true
		curInt = Math.floor((thisActor.system.stats.int.max + intTotalModifiers) / 3 / intDivider)
		curRef = Math.floor((thisActor.system.stats.ref.max + refTotalModifiers - armorEnc - encDiff) / 3 / dexDivider)
		curDex = Math.floor((thisActor.system.stats.dex.max + dexTotalModifiers - armorEnc - encDiff) / 3 / refDivider)
		curBody = Math.floor((thisActor.system.stats.body.max + bodyTotalModifiers) / 3 / bodyDivider)
		curSpd = Math.floor((thisActor.system.stats.spd.max + spdTotalModifiers - encDiff) / 3 / spdDivider)
		curEmp = Math.floor((thisActor.system.stats.emp.max + empTotalModifiers) / 3 / empDivider)
		curCra = Math.floor((thisActor.system.stats.cra.max + craTotalModifiers) / 3 / craDivider)
		curWill = Math.floor((thisActor.system.stats.will.max + willTotalModifiers) / 3 / willDivider)
		curLuck = Math.floor((thisActor.system.stats.luck.max + luckTotalModifiers) / 3 / luckDivider)
	}
	else if (HPvalue < thisActor.system.coreStats.woundTreshold.current > 0) {
		isWounded = true
		curRef = Math.floor((thisActor.system.stats.ref.max + refTotalModifiers - armorEnc - encDiff) / 2 / refDivider)
		curDex = Math.floor((thisActor.system.stats.dex.max + dexTotalModifiers - armorEnc - encDiff) / 2 / dexDivider)
		curInt = Math.floor((thisActor.system.stats.int.max + intTotalModifiers) / 2 / intDivider)
		curWill = Math.floor((thisActor.system.stats.will.max + willTotalModifiers) / 2 / willDivider)
	}

	let hpTotalModifiers = getAllModifier(thisActor, "hp").totalModifiers;
	let staTotalModifiers = getAllModifier(thisActor, "sta").totalModifiers;
	let resTotalModifiers = getAllModifier(thisActor, "resolve").totalModifiers;
	let focusTotalModifiers = getAllModifier(thisActor, "focus").totalModifiers;
	let vigorModifiers = getAllModifier(thisActor, "vigor").totalModifiers;
	let hpDivider = getAllModifier(thisActor, "hp").totalDivider;
	let staDivider = getAllModifier(thisActor, "sta").totalDivider;
	thisActor.system.derivedStats.hp.modifiers.forEach(item => hpTotalModifiers += Number(item.value));
	thisActor.system.derivedStats.sta.modifiers.forEach(item => staTotalModifiers += Number(item.value));
	thisActor.system.derivedStats.resolve.modifiers.forEach(item => resTotalModifiers += Number(item.value));
	thisActor.system.derivedStats.focus.modifiers.forEach(item => focusTotalModifiers += Number(item.value));

	let curHp = thisActor.system.derivedStats.hp.max + hpTotalModifiers;
	let curSta = thisActor.system.derivedStats.sta.max + staTotalModifiers;
	let curRes = thisActor.system.derivedStats.resolve.max + resTotalModifiers;
	let curFocus = thisActor.system.derivedStats.focus.max + focusTotalModifiers;
	let curVigor = thisActor.system.derivedStats.vigor.unmodifiedMax + vigorModifiers;

	let unmodifiedMaxHp = baseMax * 5

	if (thisActor.system.customStat != true) {
		curHp = Math.floor((base * 5 + hpTotalModifiers) / hpDivider)
		curSta = Math.floor((base * 5 + staTotalModifiers) / staDivider)
		curRes = (Math.floor((curWill + curInt) / 2) * 5) + resTotalModifiers
		curFocus = (Math.floor((curWill + curInt) / 2) * 3) + focusTotalModifiers
	}

	thisActor.update({
		'system.deathStateApplied': isDead,
		'system.woundTresholdApplied': isWounded,
		'system.stats.int.current': curInt,
		'system.stats.ref.current': curRef,
		'system.stats.dex.current': curDex,
		'system.stats.body.current': curBody,
		'system.stats.spd.current': curSpd,
		'system.stats.emp.current': curEmp,
		'system.stats.cra.current': curCra,
		'system.stats.will.current': curWill,
		'system.stats.luck.current': curLuck,

		'system.derivedStats.hp.max': curHp,
		'system.derivedStats.hp.unmodifiedMax': unmodifiedMaxHp,
		'system.derivedStats.sta.max': curSta,
		'system.derivedStats.resolve.max': curRes,
		'system.derivedStats.focus.max': curFocus,
		'system.derivedStats.vigor.max': curVigor,

		'system.coreStats.stun.current': Math.floor((Math.clamped(base, 1, 10) + stunTotalModifiers) / stunDivider),
		'system.coreStats.stun.max': Math.clamped(baseMax, 1, 10),

		'system.coreStats.enc.current': Math.floor((stats.body.current * 10 + encTotalModifiers) / encDivider),
		'system.coreStats.enc.max': stats.body.current * 10,

		'system.coreStats.run.current': Math.floor((stats.spd.current * 3 + runTotalModifiers) / runDivider),
		'system.coreStats.run.max': stats.spd.current * 3,

		'system.coreStats.leap.current': Math.floor((stats.spd.current * 3 / 5) + leapTotalModifiers) / leapDivider,
		'system.coreStats.leap.max': Math.floor(stats.spd.max * 3 / 5),

		'system.coreStats.rec.current': Math.floor((base + recTotalModifiers) / recDivider),
		'system.coreStats.rec.max': baseMax,

		'system.coreStats.woundTreshold.current': Math.floor((baseMax + wtTotalModifiers) / wtDivider),
		'system.coreStats.woundTreshold.max': baseMax,

		'system.attackStats.meleeBonus': meleeBonus,
		'system.attackStats.punch.value': `1d6+${meleeBonus}`,
		'system.attackStats.kick.value': `1d6+${4 + meleeBonus}`,
	});
}

function getAllModifier(actor, checkedStat) {
	let globalModifiers = getGlobalModifier(actor.getList("globalModifier").filter(e => e.system.isActive), checkedStat)
	let woundModifiers = getWoundModifier(actor.system.critWounds, checkedStat)

	return {
		totalModifiers: globalModifiers.totalModifiers + woundModifiers.totalModifiers,
		totalDivider: globalModifiers.totalDivider * woundModifiers.totalDivider,
	}
}

function getGlobalModifier(globalModifier, checkedStat) {
	let totalModifiers = 0;
	let totalDivider = 1;
	globalModifier?.forEach(item => {
		item.system.stats?.forEach(stat => {
			if (stat.stat == checkedStat) {
				if (stat.modifier?.toString().includes("/")) {
					totalDivider = Number(stat.modifier.replace("/", ''));
				}
				else {
					totalModifiers += Number(stat.modifier ?? 0)
				}
			}
		})

		item.system.derived?.forEach(derived => {
			if (derived.derivedStat == checkedStat) {
				if (derived.modifier?.toString().includes("/")) {
					totalDivider = Number(derived.modifier.replace("/", ''));
				}
				else {
					totalModifiers += Number(derived.modifier ?? 0)
				}
			}
		})
	});

	return {
		totalModifiers,
		totalDivider
	}
}

function getWoundModifier(wounds, checkedStat) {
	let totalModifiers = 0;
	let totalDivider = 1;

	wounds
		.filter(wound => wound.configEntry != '')
		.map(wound => CONFIG.WITCHER.Crit[wound.configEntry]?.effect[wound.mod])
		.forEach(wound => {
			wound.stats?.forEach(stat => {
				if (stat.stat == checkedStat) {
					if (stat.modifier?.toString().includes("/")) {
						totalDivider = Number(stat.modifier.replace("/", ''));
					}
					else {
						totalModifiers += Number(stat.modifier ?? 0)
					}
				}
			})

			wound.derived?.forEach(derived => {
				if (derived.derivedStat == checkedStat) {
					if (derived.modifier?.toString().includes("/")) {
						totalDivider = Number(derived.modifier.replace("/", ''));
					}
					else {
						totalModifiers += Number(derived.modifier ?? 0)
					}
				}
			})
		});

	return {
		totalModifiers,
		totalDivider
	}
}

function getArmorEcumbrance(actor) {
	let encumbranceModifier = 0
	let armors = actor.items.filter(item => item.type == "armor" && item.system.equipped);
	armors.forEach(item => {
		encumbranceModifier += item.system.encumb
	});

	let relevantModifier = actor.getList("globalModifier")
		.filter(modifier => modifier.system.isActive)
		.filter(modifier => modifier.system.special?.length > 0)
		.map(modifier => modifier.system.special)
		.flat()
		.map(modifier => CONFIG.WITCHER.specialModifier.find(special => special.id == modifier.special))
		.filter(special => special.tags.includes("armorencumbarance"))

	relevantModifier.forEach(modifier => encumbranceModifier += parseInt(modifier.formula))

	return Math.max(encumbranceModifier, 0)
}

function rollSkillCheck(actor, skillMapEntry) {
	const tolerated = ["tolerated", "toleratedFeared"]
	const feared = ["feared", "toleratedFeared", "hatedFeared"]
	const hated = ["hated", "hatedFeared"]

	let attribute = skillMapEntry.attribute;
	let attributeLabel = game.i18n.localize(attribute.label);
	let attributeValue = actor.system.stats[attribute.name].current;

	let skillName = skillMapEntry.name;
	let skillLabel = game.i18n.localize(skillMapEntry.label)
	let skillValue = actor.system.skills[attribute.name][skillName].value;

	let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")

	let messageData = {
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: `${attributeLabel}: ${skillLabel} Check`,
	}

	let rollFormula;
	if (actor.system.dontAddAttr) {
		rollFormula = !displayRollDetails ? `1d10+${skillValue}` : `1d10+${skillValue}[${skillLabel}]`;
	}
	else {
		rollFormula = !displayRollDetails ? `1d10+${attributeValue}+${skillValue}` : `1d10+${attributeValue}[${attributeLabel}]+${skillValue}[${skillLabel}]`;
	}

	if (actor.type == "character") {
		// core rulebook page 21
		if (attribute.name == "emp" && (skillName == "charisma" || skillName == "leadership" || skillName == "persuasion" || skillName == "seduction")) {
			if (tolerated.includes(actor.system.general.socialStanding)) {
				rollFormula += !displayRollDetails ? `-1` : `-1[${game.i18n.localize("WITCHER.socialStanding.tolerated")}]`;
			} else if (hated.includes(actor.system.general.socialStanding)) {
				rollFormula += !displayRollDetails ? `-2` : `-2[${game.i18n.localize("WITCHER.socialStanding.hated")}]`;
			}
		}
		if (attribute.name == "emp" && skillName == "charisma" && feared.includes(actor.system.general.socialStanding)) {
			rollFormula += !displayRollDetails ? `-1` : `-1[${game.i18n.localize("WITCHER.socialStanding.feared")}]`;
		}
		if (attribute.name == "will" && skillName == "intimidation" && feared.includes(actor.system.general.socialStanding)) {
			rollFormula += !displayRollDetails ? `+1` : `+1[${game.i18n.localize("WITCHER.socialStanding.feared")}]`;
		}
	}

	rollFormula = addAllModifiers(actor, skillMapEntry.name, rollFormula)

	let armorEnc = getArmorEcumbrance(actor)
	if (armorEnc > 0 && (skillName == "hexweave" || skillName == "ritcraft" || skillName == "spellcast")) {
		rollFormula += !displayRollDetails ? `-${armorEnc}` : `-${armorEnc}[${game.i18n.localize("WITCHER.Armor.EncumbranceValue")}]`
	}

	new Dialog({
		title: `${game.i18n.localize("WITCHER.Dialog.Skill")}: ${skillLabel}`,
		content: `<label>${game.i18n.localize("WITCHER.Dialog.attackCustom")}: <input name="customModifiers" value=0></label>`,
		buttons: {
			LocationRandom: {
				label: game.i18n.localize("WITCHER.Button.Continue"),
				callback: async html => {
					let customAtt = html.find("[name=customModifiers]")[0].value;
					if (customAtt < 0) {
						rollFormula += !displayRollDetails ? ` ${customAtt}` : ` ${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
					}
					if (customAtt > 0) {
						rollFormula += !displayRollDetails ? ` +${customAtt}` : ` +${customAtt}[${game.i18n.localize("WITCHER.Settings.Custom")}]`
					}
					let config = new RollConfig()
					config.showCrit = true
					config.showSuccess = true
					await extendedRoll(rollFormula, messageData, config)
				}
			}
		}
	}).render(true)
}

function genId() {
	return randomID(16);
};

function addAllModifiers(actor, skillName, formula) {
	formula = addSkillModifiers(actor, skillName, formula);
	formula = addGlobalModifier(actor, skillName, formula);
	formula = addWoundsModifier(actor, skillName, formula);
	return formula;
}

function addSkillModifiers(actor, skillName, formula) {
	let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
	let skill = CONFIG.WITCHER.skillMap[skillName];
	actor.system.skills[skill.attribute.name][skill.name].modifiers?.forEach(mod => {
		if (mod.value < 0) {
			formula += !displayRollDetails ? ` ${mod.value}` : ` ${mod.value}[${mod.name}]`
		}
		if (mod.value > 0) {
			formula += !displayRollDetails ? ` +${mod.value}` : ` +${mod.value}[${mod.name}]`
		}
	});
	return formula;
}

function addGlobalModifier(actor, skillName, rollFormula) {
	let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
	let globalModifier = actor.getList("effect").concat(actor.getList("globalModifier")).filter(e => e.system.isActive);
	globalModifier.forEach(modifier => {
		modifier.system.skills?.forEach(modifierSkill => {
			if (skillName == modifierSkill.skill || modifierSkill.skill == "allSkills" || CONFIG.WITCHER[modifierSkill.skill]?.includes(skillName)) {
				if (modifierSkill.modifier.includes("/")) {
					rollFormula += !displayRollDetails ? ` /${Number(modifierSkill.modifier.replace("/", ''))}` : ` /${Number(modifierSkill.modifier.replace("/", ''))}[${modifier.name}]`
				}
				else {
					rollFormula += !displayRollDetails ? ` +${modifierSkill.modifier}` : ` +${modifierSkill.modifier}[${modifier.name}]`
				}
			}
		})
	});

	return rollFormula;
}

function addWoundsModifier(actor, skillName, rollFormula) {
	let displayRollDetails = game.settings.get("TheWitcherTRPG", "displayRollsDetails")
	let wounds = actor.system.critWounds
	wounds
		.filter(wound => wound.configEntry != '')
		.map(wound => CONFIG.WITCHER.Crit[wound.configEntry].effect[wound.mod])
		.forEach(wound => {
			wound.skills?.forEach(skill => {
				if (skill.skill == skillName || CONFIG.WITCHER[skill.skillgroup]?.includes(skillName) || skill.skill == "all") {
					if (skill.modifier?.toString().includes("/")) {
						rollFormula += !displayRollDetails ? ` /${Number(skill.modifier.replace("/", ''))}` : ` /${Number(skill.modifier.replace("/", ''))}[${game.i18n.localize("WITCHER.CritWound.Header")}]`
					}
					else {
						rollFormula += !displayRollDetails ? ` ${Number(skill.modifier)}` : ` ${Number(skill.modifier)}[${game.i18n.localize("WITCHER.CritWound.Header")}]`
					}
				}
			})
		});
	return rollFormula
}

export { updateDerived, rollSkillCheck, genId, addAllModifiers, addSkillModifiers, addGlobalModifier, getArmorEcumbrance };