import { extendedRoll } from '../scripts/rolls/extendedRoll.js';
import { getRandomInt } from '../scripts/helper.js';
import { RollConfig } from '../scripts/rollConfig.js';
import { WITCHER } from '../setup/config.js';
import { modifierMixin } from './mixins/modifierMixin.js';
import { damageUtilMixin } from './mixins/damageUtilMixin.js';
import { castSpellMixin } from './mixins/castSpellMixin.js';
import { locationMixin } from './mixins/locationMixin.js';
import { weaponAttackMixin } from './mixins/weaponAttackMixin.js';
import { verbalCombatMixin } from './mixins/verbalCombatMixin.js';

const DialogV2 = foundry.applications.api.DialogV2;

export default class WitcherActor extends Actor {
    prepareDerivedData() {
        super.prepareDerivedData();

        if (this.type === 'loot') return;

        let armorEffects = this.getList('armor')
            .filter(armor => armor.system.equipped)
            .map(armor => armor.system.effects)
            .flat()
            .filter(effect => effect.statusEffect)
            .map(effect => WITCHER.armorEffects.find(armorEffect => armorEffect.id == effect.statusEffect));

        armorEffects.forEach(effect => {
            if (
                effect.refersStatusEffect &&
                !effect.addsResistance &&
                !this.statuses.find(status => status == effect.id)
            ) {
                this.toggleStatusEffect(effect.id);
            }
        });

        this.calculateStats();
        this.calculateCoreStats();
        this.calculateDerivedStats();
        this.calculateAttackStats();
    }

    calculateStats() {
        this.calculateStat('int');
        this.calculateStat('ref');
        this.calculateStat('dex');
        this.calculateStat('body');
        this.calculateStat('spd');
        this.calculateStat('emp');
        this.calculateStat('cra');
        this.calculateStat('will');
        this.calculateStat('luck');

        this.system.stats.toxicity.max += this.system.stats.toxicity.totalModifiers;
    }

    calculateStat(stat) {
        let totalModifiers = this.getAllModifiers(stat).totalModifiers + this.system.stats[stat].totalModifiers;
        this.system.stats[stat].modifiers.forEach(item => (totalModifiers += Number(item.value)));

        //Adjust for encumbrance
        if (stat === 'ref' || stat === 'dex' || stat === 'spd') {
            let bodyTotalModifiers =
                this.getAllModifiers('body').totalModifiers + this.system.stats.body.totalModifiers;
            this.system.stats.body.modifiers.forEach(item => (bodyTotalModifiers += Number(item.value)));

            let currentEncumbrance =
                (this.system.stats.body.max + bodyTotalModifiers) * 10 +
                this.getAllModifiers('enc').totalModifiers +
                this.system.coreStats.enc.totalModifiers;
            var totalWeights = this.getTotalWeight();

            let encDiff = 0;
            if (currentEncumbrance < totalWeights) {
                encDiff = Math.ceil((totalWeights - currentEncumbrance) / 5);
            }

            if (stat === 'ref' || stat === 'dex') {
                let armorEnc = this.getArmorEcumbrance();
                totalModifiers += -armorEnc - encDiff;
            }

            totalModifiers += -encDiff;
        }

        let divider = this.getAllModifiers(stat).totalDivider;

        //Adjust for hp
        let HPvalue = this.system.derivedStats.hp.value;
        if (HPvalue <= 0) {
            this.system.deathStateApplied = true;
            divider += 3;
        } else if (HPvalue < this.system.coreStats.woundTreshold.current > 0) {
            this.system.woundTresholdApplied = true;
            if (stat === 'ref' || stat === 'dex' || stat === 'int' || stat === 'will') {
                divider += 2;
            }
        }

        this.system.stats[stat].current = Math.floor((this.system.stats[stat].max + totalModifiers) / divider);
    }

    calculateCoreStats() {
        const base = Math.floor((this.system.stats.body.current + this.system.stats.will.current) / 2);
        const baseMax = Math.floor((this.system.stats.body.max + this.system.stats.will.max) / 2);

        let stunTotalModifiers =
            this.getAllModifiers('stun').totalModifiers + this.system.coreStats.stun.totalModifiers;
        let stunDivider = this.getAllModifiers('stun').totalDivider;
        this.system.coreStats.stun.modifiers.forEach(item => (stunTotalModifiers += Number(item.value)));
        this.system.coreStats.stun.current = Math.floor((Math.clamp(base, 1, 10) + stunTotalModifiers) / stunDivider);
        this.system.coreStats.stun.max = Math.clamp(baseMax, 1, 10);
        this.system.coreStats.stun.totalModifiers = stunTotalModifiers;

        let runTotalModifiers = this.getAllModifiers('run').totalModifiers + this.system.coreStats.run.totalModifiers;
        let runDivider = this.getAllModifiers('run').totalDivider;
        this.system.coreStats.run.modifiers.forEach(item => (runTotalModifiers += Number(item.value)));
        this.system.coreStats.run.current = Math.floor(
            (this.system.stats.spd.current * 3 + runTotalModifiers) / runDivider
        );
        this.system.coreStats.run.max = this.system.stats.spd.current * 3;
        this.system.coreStats.run.totalModifiers = runTotalModifiers;

        let leapTotalModifiers =
            this.getAllModifiers('leap').totalModifiers + this.system.coreStats.leap.totalModifiers;
        let leapDivider = this.getAllModifiers('leap').totalDivider;
        this.system.coreStats.leap.modifiers.forEach(item => (leapTotalModifiers += Number(item.value)));
        this.system.coreStats.leap.current =
            Math.floor((this.system.stats.spd.current * 3) / 5 + leapTotalModifiers) / leapDivider;
        this.system.coreStats.leap.max = Math.floor((this.system.stats.spd.max * 3) / 5);
        this.system.coreStats.leap.totalModifiers = leapTotalModifiers;

        let encTotalModifiers = this.getAllModifiers('enc').totalModifiers + this.system.coreStats.enc.totalModifiers;
        let encDivider = this.getAllModifiers('enc').totalDivider;
        this.system.coreStats.enc.modifiers.forEach(item => (encTotalModifiers += Number(item.value)));
        this.system.coreStats.enc.current = Math.floor(
            (this.system.stats.body.current * 10 + encTotalModifiers) / encDivider
        );
        this.system.coreStats.enc.max = this.system.stats.body.current * 10;
        this.system.coreStats.enc.totalModifiers = encTotalModifiers;

        let recTotalModifiers = this.getAllModifiers('rec').totalModifiers + this.system.coreStats.rec.totalModifiers;
        let recDivider = this.getAllModifiers('rec').totalDivider;
        this.system.coreStats.rec.modifiers.forEach(item => (recTotalModifiers += Number(item.value)));
        this.system.coreStats.rec.current = Math.floor((base + recTotalModifiers) / recDivider);
        this.system.coreStats.rec.max = baseMax;
        this.system.coreStats.rec.totalModifiers = recTotalModifiers;

        let wtTotalModifiers =
            this.getAllModifiers('woundTreshold').totalModifiers + this.system.coreStats.woundTreshold.totalModifiers;
        let wtDivider = this.getAllModifiers('woundTreshold').totalDivider;
        this.system.coreStats.woundTreshold.modifiers.forEach(item => (wtTotalModifiers += Number(item.value)));
        this.system.coreStats.woundTreshold.current = Math.floor((baseMax + wtTotalModifiers) / wtDivider);
        this.system.coreStats.woundTreshold.max = baseMax;
    }

    calculateDerivedStats() {
        this.calculateDerivedStat('hp');
        this.calculateDerivedStat('sta');
        this.calculateDerivedStat('resolve');
        this.calculateDerivedStat('focus');
        this.calculateDerivedStat('vigor');
    }

    calculateDerivedStat(stat) {
        let totalModifiers = this.getAllModifiers(stat).totalModifiers || 0;
        let divider = this.getAllModifiers(stat).totalDivider || 1;
        this.system.derivedStats[stat].modifiers.forEach(item => (totalModifiers += Number(item.value)));
        totalModifiers += this.system.derivedStats[stat].totalModifiers;

        const base = Math.floor((this.system.stats.body.current + this.system.stats.will.current) / 2);
        if (!this.system.customStat && (stat === 'hp' || stat === 'sta')) {
            this.system.derivedStats[stat].unmodifiedMax = base * 5;
        }

        let modifiedMax = this.system.derivedStats[stat].unmodifiedMax + totalModifiers;

        if (stat === 'resolve' || stat === 'focus') {
            divider += 1;
        }

        if (!this.system.customStat) {
            if (stat === 'hp' || stat === 'sta') {
                modifiedMax = Math.floor((base * 5 + totalModifiers) / divider);
            } else if (stat === 'resolve') {
                modifiedMax =
                    Math.floor((this.system.stats.will.current + this.system.stats.int.current) / divider) * 5 +
                    totalModifiers;
            }
        } else if (stat === 'focus') {
            modifiedMax =
                Math.floor((this.system.stats.will.current + this.system.stats.int.current) / divider) * 3 +
                totalModifiers;
        }

        this.system.derivedStats[stat].max = modifiedMax;
        this.system.derivedStats[stat].totalModifiers = totalModifiers;
    }

    calculateAttackStats() {
        const meleeBonus = Math.ceil((this.system.stats.body.current - 6) / 2) * 2;
        this.system.attackStats.meleeBonus += meleeBonus;
        this.system.attackStats.punch.value = `1d6+${meleeBonus}`;
        this.system.attackStats.kick.value = `1d6+${4 + meleeBonus}`;
    }

    async rollSkillCheck(skillMapEntry, threshold = -1) {
        let attribute = skillMapEntry.attribute;
        let attributeLabel = game.i18n.localize(attribute.label);
        let attributeValue = this.system.stats[attribute.name].current;

        let skillName = skillMapEntry.name;
        let skillLabel = game.i18n.localize(skillMapEntry.label);
        let skillValue = this.system.skills[attribute.name][skillName].value;

        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this }),
            flavor: `${attributeLabel}: ${skillLabel} Check`
        };

        let rollFormula = '1d10 +';
        if (game.settings.get('TheWitcherTRPG', 'woundsAffectSkillBase')) {
            rollFormula += '(';
        }
        if (!this.system.dontAddAttr) {
            rollFormula += !displayRollDetails ? `${attributeValue} +` : `${attributeValue}[${attributeLabel}] +`;
        }

        rollFormula += !displayRollDetails ? `${skillValue}` : `${skillValue}[${skillLabel}]`;
        rollFormula += this.addAllModifiers(skillMapEntry.name);

        rollFormula += this.addSocialStanding(attribute, skillName);

        let armorEnc = this.getArmorEcumbrance();
        if (armorEnc > 0 && (skillName == 'hexweave' || skillName == 'ritcraft' || skillName == 'spellcast')) {
            rollFormula += !displayRollDetails
                ? `-${armorEnc}`
                : `-${armorEnc}[${game.i18n.localize('WITCHER.Armor.EncumbranceValue')}]`;
        }

        return await DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.Dialog.Skill')}: ${skillLabel}` },
            content: `<label>${game.i18n.localize(
                'WITCHER.Dialog.attackCustom'
            )}: <input name="customModifiers" value=0></label>`,
            ok: {
                label: game.i18n.localize('WITCHER.Button.Continue'),
                callback: (event, button, dialog) => {
                    let customModifier = button.form.elements.customModifiers.value;
                    if (customModifier < 0) {
                        rollFormula += !displayRollDetails
                            ? ` ${customModifier}`
                            : ` ${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                    }
                    if (customModifier > 0) {
                        rollFormula += !displayRollDetails
                            ? ` +${customModifier}`
                            : ` +${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                    }
                    let config = new RollConfig();
                    config.showCrit = true;
                    config.showSuccess = true;
                    config.threshold = threshold;
                    return extendedRoll(rollFormula, messageData, config);
                }
            }
        });
    }

    addSocialStanding(attribute, skillName) {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        const tolerated = ['tolerated', 'toleratedFeared'];
        const feared = ['feared', 'toleratedFeared', 'hatedFeared'];
        const hated = ['hated', 'hatedFeared'];

        let socialModifiers = '';
        if (this.type == 'character') {
            // core rulebook page 21
            if (attribute.name == 'emp') {
                if (
                    skillName == 'charisma' ||
                    skillName == 'leadership' ||
                    skillName == 'persuasion' ||
                    skillName == 'seduction'
                ) {
                    if (tolerated.includes(this.system.general.socialStanding)) {
                        socialModifiers += !displayRollDetails
                            ? `-1`
                            : `-1[${game.i18n.localize('WITCHER.socialStanding.tolerated')}]`;
                    } else if (hated.includes(this.system.general.socialStanding)) {
                        socialModifiers += !displayRollDetails
                            ? `-2`
                            : `-2[${game.i18n.localize('WITCHER.socialStanding.hated')}]`;
                    }
                }

                if (skillName == 'charisma' && feared.includes(this.system.general.socialStanding)) {
                    socialModifiers += !displayRollDetails
                        ? `-1`
                        : `-1[${game.i18n.localize('WITCHER.socialStanding.feared')}]`;
                }
            }

            if (
                attribute.name == 'will' &&
                skillName == 'intimidation' &&
                feared.includes(this.system.general.socialStanding)
            ) {
                socialModifiers += !displayRollDetails
                    ? `+1`
                    : `+1[${game.i18n.localize('WITCHER.socialStanding.feared')}]`;
            }
        }

        return socialModifiers;
    }

    async rollCustomSkillCheck(event) {
        let customSkill = this.items.find(item => item.id == event.currentTarget.closest('.item').dataset.itemId);

        let attribute = CONFIG.WITCHER.statMap[customSkill.system.attribute];
        let attributeLabel = game.i18n.localize(attribute.label);
        let attributeValue = this.system.stats[attribute.name].current;

        let skillLabel = customSkill.name;
        let skillValue = customSkill.system.value;

        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this }),
            flavor: `${attributeLabel}: ${skillLabel} Check`
        };

        let rollFormula;
        if (this.system.dontAddAttr) {
            rollFormula = !displayRollDetails ? `1d10+${skillValue}` : `1d10+${skillValue}[${skillLabel}]`;
        } else {
            rollFormula = !displayRollDetails
                ? `1d10+${attributeValue}+${skillValue}`
                : `1d10+${attributeValue}[${attributeLabel}]+${skillValue}[${skillLabel}]`;
        }

        rollFormula += this.addAllModifiers(customSkill.name);
        customSkill.system.modifiers?.forEach(mod => {
            if (mod.value < 0) {
                rollFormula += !displayRollDetails ? ` ${mod.value}` : ` ${mod.value}[${mod.name}]`;
            }
            if (mod.value > 0) {
                rollFormula += !displayRollDetails ? ` +${mod.value}` : ` +${mod.value}[${mod.name}]`;
            }
        });

        return DialogV2.prompt({
            window: { title: `${game.i18n.localize('WITCHER.Dialog.Skill')}: ${skillLabel}` },
            content: `<label>${game.i18n.localize(
                'WITCHER.Dialog.attackCustom'
            )}: <input name="customModifiers" value=0></label>`,
            ok: {
                label: game.i18n.localize('WITCHER.Button.Continue'),
                callback: (event, button, dialog) => {
                    let customModifier = button.form.elements.customModifiers.value;
                    if (customModifier < 0) {
                        rollFormula += !displayRollDetails
                            ? ` ${customModifier}`
                            : ` ${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                    }
                    if (customModifier > 0) {
                        rollFormula += !displayRollDetails
                            ? ` +${customModifier}`
                            : ` +${customModifier}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                    }
                    let config = new RollConfig();
                    config.showCrit = true;
                    config.showSuccess = true;
                    return extendedRoll(rollFormula, messageData, config);
                }
            }
        });
    }

    getArmorEcumbrance() {
        let encumbranceModifier = -this.system.lifepathModifiers.ignoredArmorEncumbrance;
        let armors = this.items.filter(item => item.type == 'armor' && item.system.equipped);
        armors.forEach(item => {
            encumbranceModifier += item.system.encumb;
        });

        let relevantModifier = this.getList('globalModifier')
            .filter(modifier => modifier.system.isActive)
            .filter(modifier => modifier.system.special?.length > 0)
            .map(modifier => modifier.system.special)
            .flat()
            .map(modifier => CONFIG.WITCHER.specialModifier.find(special => special.id == modifier.special))
            .filter(special => special?.tags?.includes('armorencumbarance'));

        let relevantActorModifier = this.system.specialSkillModifiers
            .map(specialSkillModifier =>
                CONFIG.WITCHER.specialModifier.find(special => special.id == specialSkillModifier.modifier)
            )
            .filter(special => special?.tags?.includes('armorencumbarance'));

        relevantModifier
            .concat(relevantActorModifier)
            .forEach(modifier => (encumbranceModifier += parseInt(modifier.formula)));

        return Math.max(encumbranceModifier, 0);
    }

    async useItem(itemId) {
        let item = this.items.get(itemId);

        if (!item) return;

        if (item.type === 'weapon') {
            return this.rollWeapon(item);
        }

        if (item.type === 'spell') {
            return this.castSpell(item);
        }

        if (item.system.isConsumable) {
            item.consume();
            this.removeItem(item.id, 1);
        }
    }

    async rollWeapon(weapon) {
        return this.weaponAttack(weapon);
    }

    async rollSkill(skillName, threshold = -1) {
        return this.rollSkillCheck(CONFIG.WITCHER.skillMap[skillName], threshold);
    }

    getDefenseSuccessFlags(defenseSkill) {
        return {
            origin: {
                name: this.name,
                uuid: this.uuid
            },
            defenseSkill: defenseSkill,
            defense: true
        };
    }

    getDefenseFailFlags(defenseSkill) {
        return {
            origin: {
                name: this.name,
                uuid: this.uuid
            },
            defenseSkill: defenseSkill,
            defense: false
        };
    }

    isEnoughThrowableWeapon(item) {
        if (item.system.isThrowable) {
            let throwableItems = this.items.filter(w => w.type == 'weapon' && w.name == item.name);

            let quantity =
                throwableItems[0].system.quantity >= 0
                    ? throwableItems[0].system.quantity
                    : throwableItems.sum('quantity');
            return quantity > 0;
        } else {
            return false;
        }
    }

    getTotalWeight() {
        var total = 0;
        this.items.forEach(item => {
            if (item.system.weight && item.system.quantity && item.system.isCarried && !item.system.isStored) {
                total += item.system.quantity * item.system.weight + (item.system.storedWeight ?? 0);
            }
        });
        return Math.ceil(total + this.calc_currency_weight());
    }

    calc_currency_weight() {
        let currency = this.system.currency;
        let totalPieces = 0;
        totalPieces += Number(currency.bizant);
        totalPieces += Number(currency.ducat);
        totalPieces += Number(currency.lintar);
        totalPieces += Number(currency.floren);
        totalPieces += Number(currency.crown);
        totalPieces += Number(currency.oren);
        totalPieces += Number(currency.falsecoin);
        return Number(totalPieces * 0.001);
    }

    getSubstance(name) {
        return this.getList('component').filter(
            i => i.system.type == 'substances' && i.system.substanceType == name && !i.system.isStored
        );
    }

    getList(name) {
        return this.items.filter(i => i.type == name && !i.system.isStored);
    }

    // Find needed component in the items list based on the component name or based on the exact name of the substance in the players compendium
    // Components in the diagrams are only string fields.
    // It is possible for diagram to have component which is actually the substance
    // That is why we need to check whether specific component name could be a substance
    // Ideally we need to store some flag (substances list for diagrams) to the diagram components
    // which will indicate whether the component is substance or not.
    // Such modification may require either modification dozens of compendiums, or some additional parsers
    findNeededComponent(componentName) {
        return this.items.filter(
            item =>
                item.type == 'component' &&
                (item.name == componentName ||
                    (item.system.type == 'substances' &&
                        ((game.i18n.localize('WITCHER.Inventory.Vitriol') == componentName &&
                            item.system.substanceType == 'vitriol') ||
                            (game.i18n.localize('WITCHER.Inventory.Rebis') == componentName &&
                                item.system.substanceType == 'rebis') ||
                            (game.i18n.localize('WITCHER.Inventory.Aether') == componentName &&
                                item.system.substanceType == 'aether') ||
                            (game.i18n.localize('WITCHER.Inventory.Quebrith') == componentName &&
                                item.system.substanceType == 'quebrith') ||
                            (game.i18n.localize('WITCHER.Inventory.Hydragenum') == componentName &&
                                item.system.substanceType == 'hydragenum') ||
                            (game.i18n.localize('WITCHER.Inventory.Vermilion') == componentName &&
                                item.system.substanceType == 'vermilion') ||
                            (game.i18n.localize('WITCHER.Inventory.Sol') == componentName &&
                                item.system.substanceType == 'sol') ||
                            (game.i18n.localize('WITCHER.Inventory.Caelum') == componentName &&
                                item.system.substanceType == 'caelum') ||
                            (game.i18n.localize('WITCHER.Inventory.Fulgur') == componentName &&
                                item.system.substanceType == 'fulgur'))))
        );
    }

    async addItem(addItem, numberOfItem, forcecreate = false) {
        let foundItem = this.items.find(item => item.name == addItem.name && item.type == addItem.type);
        if (foundItem && !forcecreate && !foundItem.system.isStored) {
            await foundItem.update({ 'system.quantity': Number(foundItem.system.quantity) + Number(numberOfItem) });
        } else {
            let newItem = { ...addItem.toObject(false) };

            if (numberOfItem) {
                newItem.system.quantity = Number(numberOfItem);
            }
            await this.createEmbeddedDocuments('Item', [newItem]);
        }
    }

    async removeItem(itemId, quantityToRemove) {
        let foundItem = this.items.get(itemId);
        let newQuantity = foundItem.system.quantity - quantityToRemove;
        if (newQuantity <= 0) {
            await this.items.get(itemId).delete();
        } else {
            await foundItem.update({ 'system.quantity': newQuantity });
        }
    }

    async removeItemsOfType(type) {
        this.deleteEmbeddedDocuments(
            'Item',
            this.items.filter(item => item.type === type).map(item => item.id)
        );
    }

    static getAllLocations() {
        let locations = ['head', 'torso', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg'];

        if (this.type == 'monster' && this.system.hasTailWing) {
            locations.push('tailWing');
        }

        return locations;
    }

    static getLocationObject(location) {
        let alias = '';
        let modifier = `+0`;
        let locationFormula;
        switch (location) {
            case 'randomHuman':
                let randomHumanLocation = getRandomInt(10);
                switch (randomHumanLocation) {
                    case 1:
                        location = 'head';
                        locationFormula = 3;
                        break;
                    case 2:
                    case 3:
                    case 4:
                        location = 'torso';
                        locationFormula = 1;
                        break;
                    case 5:
                        location = 'rightArm';
                        locationFormula = 0.5;
                        break;
                    case 6:
                        location = 'leftArm';
                        locationFormula = 0.5;
                        break;
                    case 7:
                    case 8:
                        location = 'rightLeg';
                        locationFormula = 0.5;
                        break;
                    case 9:
                    case 10:
                        location = 'leftLeg';
                        locationFormula = 0.5;
                        break;
                    default:
                        location = 'torso';
                        locationFormula = 1;
                        break;
                }
                alias = `${game.i18n.localize('WITCHER.Location.Random')}`;
                break;
            case 'randomMonster':
                let randomMonsterLocation = getRandomInt(10);
                switch (randomMonsterLocation) {
                    case 1:
                        location = 'head';
                        locationFormula = 3;
                        break;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        location = 'torso';
                        locationFormula = 1;
                        break;
                    case 6:
                    case 7:
                        location = 'rightLeg';
                        locationFormula = 0.5;
                        break;
                    case 8:
                    case 9:
                        location = 'leftLeg';
                        locationFormula = 0.5;
                        break;
                    case 10:
                        location = 'tailWing';
                        locationFormula = 0.5;
                        break;
                    default:
                        location = 'torso';
                        locationFormula = 1;
                        break;
                }
                alias = `${game.i18n.localize('WITCHER.Location.Random')}`;
                break;
            case 'head':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationHead')}`;
                locationFormula = 3;
                modifier = `-6`;
                break;
            case 'torso':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationTorso')}`;
                locationFormula = 1;
                modifier = `-1`;
                break;
            case 'rightArm':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationRight')} ${game.i18n.localize(
                    'WITCHER.Armor.LocationArm'
                )}`;
                locationFormula = 0.5;
                modifier = `-3`;
                break;
            case 'leftArm':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationLeft')} ${game.i18n.localize(
                    'WITCHER.Armor.LocationArm'
                )}`;
                locationFormula = 0.5;
                modifier = `-3`;
                break;
            case 'rightLeg':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationRight')} ${game.i18n.localize(
                    'WITCHER.Armor.LocationLeg'
                )}`;
                locationFormula = 0.5;
                modifier = `-2`;
                break;
            case 'leftLeg':
                alias = `${game.i18n.localize('WITCHER.Armor.LocationLeft')} ${game.i18n.localize(
                    'WITCHER.Armor.LocationLeg'
                )}`;
                locationFormula = 0.5;
                modifier = `-2`;
                break;
            case 'tailWing':
                alias = `${game.i18n.localize('WITCHER.Dialog.attackTail')}`;
                locationFormula = 0.5;
                break;
            default:
                alias = `${game.i18n.localize('WITCHER.Armor.LocationTorso')}`;
                locationFormula = 1;
                modifier = `-1`;
                break;
        }

        return {
            name: location,
            alias: alias,
            locationFormula: locationFormula,
            modifier: modifier
        };
    }
}

Object.assign(WitcherActor.prototype, modifierMixin);
Object.assign(WitcherActor.prototype, damageUtilMixin);
Object.assign(WitcherActor.prototype, weaponAttackMixin);
Object.assign(WitcherActor.prototype, castSpellMixin);
Object.assign(WitcherActor.prototype, verbalCombatMixin);
Object.assign(WitcherActor.prototype, locationMixin);
