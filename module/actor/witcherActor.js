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
import { defenseMixin } from './mixins/defenseMixin.js';
import { damageMixin } from './mixins/damageMixin.js';
import { activeEffectMixin } from './mixins/activeEffectMixin.js';
import ChatMessageData from '../chatMessage/chatMessageData.js';
import { professionMixin } from './mixins/professionMixin.js';
import { armorMixin } from './mixins/armorMixin.js';
import { healMixin } from './mixins/healMixin.js';
import { rewardsMixin } from './mixins/rewardsMixin.js';
import { craftingMixin } from './mixins/craftingMixin.js';

const DialogV2 = foundry.applications.api.DialogV2;

const derivedPaths = ['derivedStats', 'attackStats'];

export default class WitcherActor extends Actor {
    /**
     * An array of ActiveEffect instances which are present on the Actor or Items which have a limited duration.
     * @type {ActiveEffect[]}
     */
    get temporaryEffects() {
        let temporaryEffects = super.temporaryEffects;

        let temporaryItemImprovements = this.items
            .map(item => item.effects.filter(effect => effect.isAppliedTemporaryItemImprovement))
            .flat();
        return temporaryEffects.concat(temporaryItemImprovements);
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        if (this.type === 'loot') return;
        if (this.type === 'mystery') return;

        let armorEffects = this.getList('armor')
            .filter(armor => armor.system.equipped)
            .map(armor => armor.system.effects)
            .flat()
            .filter(effect => effect.statusEffect)
            .map(effect => WITCHER.armorEffects.find(armorEffect => armorEffect.id == effect.statusEffect));

        armorEffects.forEach(effect => {
            this.applyStatus(effect);
        });

        this.calculateStats();
        this.calculateFixedDerivedStats();
        this.calculateStats();
        this.calculateDerivedStats();
        this.calculateAttackStats();
        this.applyActiveEffects('derived');
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

        this.system.stats.toxicity.max =
            this.system.stats.toxicity.unmodifiedMax + this.system.stats.toxicity.totalModifiers;
        this.system.stats.luck.max = this.system.stats.luck.unmodifiedMax + this.system.stats.luck.totalModifiers;
        this.system.reputation.value = this.system.reputation.max;
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
                this.system.derivedStats.enc.totalModifiers;
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
            divider += 2;
        } else if (HPvalue < this.system.derivedStats.woundTreshold.value > 0) {
            this.system.woundTresholdApplied = true;
            if (stat === 'ref' || stat === 'dex' || stat === 'int' || stat === 'will') {
                divider += 1;
            }
        }

        this.system.stats[stat].value = Math.floor((this.system.stats[stat].max + totalModifiers) / divider);
    }

    calculateFixedDerivedStats() {
        const base = Math.floor((this.system.stats.body.value + this.system.stats.will.value) / 2);
        const baseMax = Math.floor((this.system.stats.body.max + this.system.stats.will.max) / 2);

        let stunTotalModifiers =
            this.getAllModifiers('stun').totalModifiers + this.system.derivedStats.stun.totalModifiers;
        let stunDivider = this.getAllModifiers('stun').totalDivider;
        this.system.derivedStats.stun.modifiers.forEach(item => (stunTotalModifiers += Number(item.value)));
        this.system.derivedStats.stun.value = Math.floor((Math.clamp(base, 1, 10) + stunTotalModifiers) / stunDivider);
        this.system.derivedStats.stun.max = Math.clamp(baseMax, 1, 10);
        this.system.derivedStats.stun.totalModifiers = stunTotalModifiers;

        let runTotalModifiers =
            this.getAllModifiers('run').totalModifiers + this.system.derivedStats.run.totalModifiers;
        let runDivider = this.getAllModifiers('run').totalDivider;
        this.system.derivedStats.run.modifiers.forEach(item => (runTotalModifiers += Number(item.value)));
        this.system.derivedStats.run.value = Math.floor(
            (this.system.stats.spd.value * 3 + runTotalModifiers) / runDivider
        );
        this.system.derivedStats.run.max = this.system.stats.spd.value * 3;
        this.system.derivedStats.run.totalModifiers = runTotalModifiers;

        let leapTotalModifiers =
            this.getAllModifiers('leap').totalModifiers + this.system.derivedStats.leap.totalModifiers;
        let leapDivider = this.getAllModifiers('leap').totalDivider;
        this.system.derivedStats.leap.modifiers.forEach(item => (leapTotalModifiers += Number(item.value)));
        this.system.derivedStats.leap.value =
            Math.floor((this.system.stats.spd.value * 3) / 5 + leapTotalModifiers) / leapDivider;
        this.system.derivedStats.leap.max = Math.floor((this.system.stats.spd.max * 3) / 5);
        this.system.derivedStats.leap.totalModifiers = leapTotalModifiers;

        let encTotalModifiers =
            this.getAllModifiers('enc').totalModifiers + this.system.derivedStats.enc.totalModifiers;
        let encDivider = this.getAllModifiers('enc').totalDivider;
        this.system.derivedStats.enc.modifiers.forEach(item => (encTotalModifiers += Number(item.value)));
        this.system.derivedStats.enc.value = Math.floor(
            (this.system.stats.body.value * 10 + encTotalModifiers) / encDivider
        );
        this.system.derivedStats.enc.max = this.system.stats.body.value * 10;
        this.system.derivedStats.enc.totalModifiers = encTotalModifiers;

        let recTotalModifiers =
            this.getAllModifiers('rec').totalModifiers + this.system.derivedStats.rec.totalModifiers;
        let recDivider = this.getAllModifiers('rec').totalDivider;
        this.system.derivedStats.rec.modifiers.forEach(item => (recTotalModifiers += Number(item.value)));
        this.system.derivedStats.rec.value = Math.floor((base + recTotalModifiers) / recDivider);
        this.system.derivedStats.rec.max = baseMax;
        this.system.derivedStats.rec.totalModifiers = recTotalModifiers;

        let wtTotalModifiers =
            this.getAllModifiers('woundTreshold').totalModifiers +
            this.system.derivedStats.woundTreshold.totalModifiers;
        let wtDivider = this.getAllModifiers('woundTreshold').totalDivider;
        this.system.derivedStats.woundTreshold.modifiers.forEach(item => (wtTotalModifiers += Number(item.value)));
        this.system.derivedStats.woundTreshold.value = Math.floor((baseMax + wtTotalModifiers) / wtDivider);
        this.system.derivedStats.woundTreshold.max = baseMax;
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

        const base = Math.floor((this.system.stats.body.value + this.system.stats.will.value) / 2);
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
                    Math.floor((this.system.stats.will.value + this.system.stats.int.value) / divider) * 5 +
                    totalModifiers;
            } else if (stat === 'focus') {
                modifiedMax =
                    Math.floor((this.system.stats.will.value + this.system.stats.int.value) / divider) * 3 +
                    totalModifiers;
            }
        }

        this.system.derivedStats[stat].max = modifiedMax;
        this.system.derivedStats[stat].totalModifiers = totalModifiers;
    }

    calculateAttackStats() {
        const meleeBonus = Math.ceil((this.system.stats.body.value - 6) / 2) * 2;
        this.system.attackStats.meleeBonus += meleeBonus;
        this.system.attackStats.punch.value = `1d6+${meleeBonus}`;
        this.system.attackStats.kick.value = `1d6+${4 + meleeBonus}`;
    }

    applyActiveEffects(preparationStage) {
        const overrides = {};
        const changes = [];

        switch (preparationStage) {
            case 'derived':
                // Organize non-disabled effects by their application priority
                for (const effect of this.allApplicableEffects()) {
                    if (!effect.active) continue;
                    changes.push(
                        ...effect.changes
                            .filter(change => derivedPaths.some(path => change.key.includes(path)))
                            .map(change => {
                                const c = foundry.utils.deepClone(change);
                                c.effect = effect;
                                c.priority = c.priority ?? c.mode * 10;
                                return c;
                            })
                    );
                }
                break;
            default:
                //this is the native foundry call
                this.statuses.clear();
                // Organize non-disabled effects by their application priority
                for (const effect of this.allApplicableEffects()) {
                    if (!effect.active) continue;
                    changes.push(
                        ...effect.changes.map(change => {
                            const c = foundry.utils.deepClone(change);
                            c.effect = effect;
                            c.priority = c.priority ?? c.mode * 10;
                            return c;
                        })
                    );
                    for (const statusId of effect.statuses) this.statuses.add(statusId);
                }
        }

        changes.sort((a, b) => a.priority - b.priority);

        // Apply all changes
        for (const change of changes) {
            if (!change.key) continue;
            const changes = change.effect.apply(this, change);
            Object.assign(overrides, changes);
        }

        // Expand the set of final overrides
        this.overrides = foundry.utils.expandObject(overrides);
    }

    async rollSkill(skillName, threshold = -1) {
        return this.rollSkillCheck(CONFIG.WITCHER.skillMap[skillName], threshold);
    }

    async rollSkillCheck(skillMapEntry, threshold = -1) {
        let attribute = skillMapEntry.attribute;
        let attributeLabel = game.i18n.localize(attribute.label);
        let attributeValue = this.system.stats[attribute.name].value;

        let skillName = skillMapEntry.name;
        let skillLabel = game.i18n.localize(skillMapEntry.label);
        let skillValue = this.system.skills[attribute.name][skillName].value;

        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let messageData = new ChatMessageData(this, `${attributeLabel}: ${skillLabel} Check`);

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
            },
            rejectClose: true
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
        let attributeValue = this.system.stats[attribute.name].value;

        let skillLabel = customSkill.name;
        let skillValue = customSkill.system.value;

        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');

        let messageData = new ChatMessageData(this, `${attributeLabel}: ${skillLabel} Check`);

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
            },
            rejectClose: true
        });
    }

    async applyStatus(effects) {
        effects
            .filter(effect => !!effect.statusEffect)
            .forEach(effect => {
                if (!this.statuses.find(status => status == effect.statusEffect)) {
                    this.toggleStatusEffect(effect.statusEffect);
                }

                if (this.system.statusEffectImmunities?.find(immunity => immunity == statusEffectId)) {
                    //untoggle it so people see it was tried to be applied but failed
                    setTimeout(() => {
                        this.toggleStatusEffect(statusEffectId);
                    }, 1000);
                }
            });
    }

    async removeStatus(effects) {
        effects
            .filter(effect => !!effect.statusEffect)
            .forEach(effect => {
                if (this.statuses.find(status => status == effect.statusEffect)) {
                    this.toggleStatusEffect(effect.statusEffect);
                }
            });
    }

    async useItem(itemId, options) {
        let item = this.items.get(itemId);

        if (!item) return;

        if (item.type === 'weapon') {
            return this.weaponAttack(item, options);
        }

        if (item.type === 'spell' || item.type === 'hex' || item.type === 'ritual') {
            return this.castSpell(item);
        }

        if (item.system.isConsumable) {
            item.consume();
            this.removeItem(item.id, 1);
            return;
        }
    }

    getTotalWeight() {
        let total = this.items.reduce((total, item) => (total += item.system.calcWeight?.() ?? 0), 0);
        return Math.ceil(total + this.system.calcCurrencyWeight());
    }

    getList(name) {
        if (name === 'shield') {
            return this.items
                .filter(item => item.type == 'armor' && item.system.location == 'Shield')
                .sort((a, b) => a.sort - b.sort);
        }
        return this.items.filter(i => i.type == name && !i.system.isStored).sort((a, b) => a.sort - b.sort);
    }

    async addItem(addItem, numberOfItem, forcecreate = false) {
        let foundItem = this.items.find(item => item.name == addItem.name && item.type == addItem.type);
        if (foundItem && !forcecreate && !foundItem.system.isStored) {
            await foundItem.update({ 'system.quantity': Number(foundItem.system.quantity) + Number(numberOfItem) });
        } else {
            //if toObject cannot be called, we dont have a source => we dont need to call toObject
            let newItem = addItem.toObject ? addItem.toObject(false) : addItem;

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

Object.assign(WitcherActor.prototype, professionMixin);
Object.assign(WitcherActor.prototype, modifierMixin);
Object.assign(WitcherActor.prototype, damageMixin);
Object.assign(WitcherActor.prototype, damageUtilMixin);
Object.assign(WitcherActor.prototype, weaponAttackMixin);
Object.assign(WitcherActor.prototype, defenseMixin);
Object.assign(WitcherActor.prototype, healMixin);
Object.assign(WitcherActor.prototype, castSpellMixin);
Object.assign(WitcherActor.prototype, verbalCombatMixin);
Object.assign(WitcherActor.prototype, locationMixin);
Object.assign(WitcherActor.prototype, activeEffectMixin);
Object.assign(WitcherActor.prototype, armorMixin);
Object.assign(WitcherActor.prototype, rewardsMixin);
Object.assign(WitcherActor.prototype, craftingMixin);
