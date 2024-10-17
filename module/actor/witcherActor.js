import { extendedRoll } from '../scripts/rolls/extendedRoll.js';
import { getRandomInt } from '../scripts/helper.js';
import { RollConfig } from '../scripts/rollConfig.js';
import { WITCHER } from '../setup/config.js';
import { modifierMixin } from './mixins/modifierMixin.js';

export default class WitcherActor extends Actor {
    prepareDerivedData() {
        super.prepareDerivedData();

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
        this.calculateStat('toxicity');
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
            let armorEnc = this.getArmorEcumbrance();

            if (stat === 'ref' || stat === 'dex') {
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

        const baseMax = Math.floor((this.system.stats.body.max + this.system.stats.will.max) / 2);
        let unmodifiedMaxHp = baseMax * 5;
        this.system.derivedStats.hp.unmodifiedMax = unmodifiedMaxHp;
    }

    calculateDerivedStat(stat) {
        let totalModifiers = this.getAllModifiers(stat).totalModifiers || 0;
        let divider = this.getAllModifiers(stat).totalDivider || 0;
        this.system.derivedStats[stat].modifiers.forEach(item => (totalModifiers += Number(item.value)));

        let current = this.system.derivedStats[stat].max + totalModifiers;

        const base = Math.floor((this.system.stats.body.current + this.system.stats.will.current) / 2);

        if (stat === 'resolve' || stat === 'focus') {
            divider += 2;
        }
        if (this.system.customStat != true) {
            if (stat === 'hp' || stat === 'sta') {
                current = Math.floor((base * 5 + totalModifiers) / divider);
            } else if (stat === 'resolve') {
                current =
                    Math.floor((this.system.stats.will.current + this.system.stats.int.current) / divider) * 5 +
                    totalModifiers;
            } else if (stat === 'focus') {
                current =
                    Math.floor((this.system.stats.will.current + this.system.stats.int.current) / divider) * 3 +
                    totalModifiers;
            }
        }

        this.system.derivedStats[stat].max = current;
        this.system.derivedStats[stat].totalModifiers = totalModifiers;
    }

    calculateAttackStats() {
        const meleeBonus = Math.ceil((this.system.stats.body.current - 6) / 2) * 2;
        this.system.attackStats.meleeBonus = meleeBonus;
        this.system.attackStats.punch.value = `1d6+${meleeBonus}`;
        this.system.attackStats.kick.value = `1d6+${4 + meleeBonus}`;
    }

    rollSkillCheck(skillMapEntry) {
        const tolerated = ['tolerated', 'toleratedFeared'];
        const feared = ['feared', 'toleratedFeared', 'hatedFeared'];
        const hated = ['hated', 'hatedFeared'];

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

        let rollFormula;
        if (this.system.dontAddAttr) {
            rollFormula = !displayRollDetails ? `1d10+${skillValue}` : `1d10+${skillValue}[${skillLabel}]`;
        } else {
            rollFormula = !displayRollDetails
                ? `1d10+${attributeValue}+${skillValue}`
                : `1d10+${attributeValue}[${attributeLabel}]+${skillValue}[${skillLabel}]`;
        }

        if (this.type == 'character') {
            // core rulebook page 21
            if (
                attribute.name == 'emp' &&
                (skillName == 'charisma' ||
                    skillName == 'leadership' ||
                    skillName == 'persuasion' ||
                    skillName == 'seduction')
            ) {
                if (tolerated.includes(this.system.general.socialStanding)) {
                    rollFormula += !displayRollDetails
                        ? `-1`
                        : `-1[${game.i18n.localize('WITCHER.socialStanding.tolerated')}]`;
                } else if (hated.includes(this.system.general.socialStanding)) {
                    rollFormula += !displayRollDetails
                        ? `-2`
                        : `-2[${game.i18n.localize('WITCHER.socialStanding.hated')}]`;
                }
            }
            if (
                attribute.name == 'emp' &&
                skillName == 'charisma' &&
                feared.includes(this.system.general.socialStanding)
            ) {
                rollFormula += !displayRollDetails
                    ? `-1`
                    : `-1[${game.i18n.localize('WITCHER.socialStanding.feared')}]`;
            }
            if (
                attribute.name == 'will' &&
                skillName == 'intimidation' &&
                feared.includes(this.system.general.socialStanding)
            ) {
                rollFormula += !displayRollDetails
                    ? `+1`
                    : `+1[${game.i18n.localize('WITCHER.socialStanding.feared')}]`;
            }
        }

        rollFormula += this.addAllModifiers(skillMapEntry.name);

        let armorEnc = this.getArmorEcumbrance();
        if (armorEnc > 0 && (skillName == 'hexweave' || skillName == 'ritcraft' || skillName == 'spellcast')) {
            rollFormula += !displayRollDetails
                ? `-${armorEnc}`
                : `-${armorEnc}[${game.i18n.localize('WITCHER.Armor.EncumbranceValue')}]`;
        }

        new Dialog({
            title: `${game.i18n.localize('WITCHER.Dialog.Skill')}: ${skillLabel}`,
            content: `<label>${game.i18n.localize(
                'WITCHER.Dialog.attackCustom'
            )}: <input name="customModifiers" value=0></label>`,
            buttons: {
                LocationRandom: {
                    label: game.i18n.localize('WITCHER.Button.Continue'),
                    callback: async html => {
                        let customAtt = html.find('[name=customModifiers]')[0].value;
                        if (customAtt < 0) {
                            rollFormula += !displayRollDetails
                                ? ` ${customAtt}`
                                : ` ${customAtt}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                        }
                        if (customAtt > 0) {
                            rollFormula += !displayRollDetails
                                ? ` +${customAtt}`
                                : ` +${customAtt}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                        }
                        let config = new RollConfig();
                        config.showCrit = true;
                        config.showSuccess = true;
                        await extendedRoll(rollFormula, messageData, config);
                    }
                }
            }
        }).render(true);
    }

    rollCustomSkillCheck(event) {
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

        new Dialog({
            title: `${game.i18n.localize('WITCHER.Dialog.Skill')}: ${skillLabel}`,
            content: `<label>${game.i18n.localize(
                'WITCHER.Dialog.attackCustom'
            )}: <input name="customModifiers" value=0></label>`,
            buttons: {
                LocationRandom: {
                    label: game.i18n.localize('WITCHER.Button.Continue'),
                    callback: async html => {
                        let customModifier = html.find('[name=customModifiers]')[0].value;
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
                        await extendedRoll(rollFormula, messageData, config);
                    }
                }
            }
        }).render(true);
    }

    getArmorEcumbrance() {
        let encumbranceModifier = 0;
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

    async rollItem(itemId) {
        this.sheet._onItemRoll(null, itemId);
    }

    async rollSpell(itemId) {
        this.sheet._onSpellRoll(null, itemId);
    }

    async rollSkill(skillName) {
        this.rollSkillCheck(CONFIG.WITCHER.skillMap[skillName]);
    }

    getControlledToken() {
        let tokens = game.canvas.tokens.controlled;
        return tokens.length > 0 ? tokens[0].document : game.user.character?.token;
    }

    getDamageFlags() {
        return {
            origin: {
                name: this.name,
                uuid: this.uuid
            },
            damage: true
        };
    }

    getNoDamageFlags() {
        return {
            origin: {
                name: this.name,
                uuid: this.uuid
            },
            damage: false
        };
    }

    async verbalCombat() {
        let displayRollDetails = game.settings.get('TheWitcherTRPG', 'displayRollsDetails');
        const dialogTemplate = await renderTemplate('systems/TheWitcherTRPG/templates/dialog/verbal-combat.hbs', {
            verbalCombat: CONFIG.WITCHER.verbalCombat
        });
        new Dialog({
            title: game.i18n.localize('WITCHER.verbalCombat.DialogTitle'),
            content: dialogTemplate,
            buttons: {
                t1: {
                    label: `${game.i18n.localize('WITCHER.Dialog.ButtonRoll')}`,
                    callback: async html => {
                        let checkedBox = document.querySelector('input[name="verbalCombat"]:checked');
                        let group = checkedBox.dataset.group;
                        let verbal = checkedBox.value;

                        let verbalCombat = CONFIG.WITCHER.verbalCombat[group][verbal];
                        let vcName = verbalCombat.name;

                        let vcStatName = verbalCombat.skill?.attribute.label ?? 'WITCHER.Context.unavailable';
                        let vcStat = verbalCombat.skill
                            ? this.system.stats[verbalCombat.skill.attribute.name]?.current
                            : 0;

                        let vcSkillName = verbalCombat.skill?.label ?? 'WITCHER.Context.unavailable';
                        let vcSkill = verbalCombat.skill
                            ? this.system.skills[verbalCombat.skill.attribute.name][verbalCombat.skill.name]?.value
                            : 0;

                        let vcDmg = verbalCombat.baseDmg
                            ? `${verbalCombat.baseDmg}+${this.system.stats[verbalCombat.dmgStat.name].current}[${game.i18n.localize(verbalCombat.dmgStat?.label)}]`
                            : game.i18n.localize('WITCHER.verbalCombat.None');
                        if (verbal == 'Counterargue') {
                            vcDmg = `${game.i18n.localize('WITCHER.verbalCombat.CounterargueDmg')}`;
                        }

                        let effect = verbalCombat.effect;

                        let rollFormula = `1d10`;

                        if (verbalCombat.skill) {
                            rollFormula += !displayRollDetails
                                ? ` +${vcStat} +${vcSkill}`
                                : ` +${vcStat}[${game.i18n.localize(vcStatName)}] +${vcSkill}[${game.i18n.localize(vcSkillName)}]`;
                            rollFormula += this.addAllModifiers(verbalCombat.skill.name);
                        }

                        let customAtt = html.find('[name=customModifiers]')[0].value;
                        if (customAtt < 0) {
                            rollFormula += !displayRollDetails
                                ? `${customAtt}`
                                : `${customAtt}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                        }
                        if (customAtt > 0) {
                            rollFormula += !displayRollDetails
                                ? `+${customAtt}`
                                : `+${customAtt}[${game.i18n.localize('WITCHER.Settings.Custom')}]`;
                        }

                        let messageData = {
                            speaker: ChatMessage.getSpeaker({ actor: this })
                        };
                        messageData.flavor = `
            <div class="verbal-combat-attack-message">
              <h2>${game.i18n.localize('WITCHER.verbalCombat.Title')}: ${game.i18n.localize(vcName)}</h2>
              <b>${game.i18n.localize('WITCHER.Weapon.Damage')}</b>: ${vcDmg} <br />
              ${game.i18n.localize(effect)}
              <hr />
              </div>`;
                        messageData.flavor += vcDmg.includes('d')
                            ? `<button class="vcDamage" > ${game.i18n.localize('WITCHER.table.Damage')}</button>`
                            : '';

                        let config = new RollConfig();
                        config.showCrit = true;
                        await extendedRoll(
                            rollFormula,
                            messageData,
                            config,
                            this.createVerbalCombatFlags(verbalCombat, vcDmg)
                        );
                    }
                },
                t2: {
                    label: `${game.i18n.localize('WITCHER.Button.Cancel')}`
                }
            }
        }).render(true);
    }

    createVerbalCombatFlags(verbalCombat, vcDamage) {
        return [
            {
                key: 'verbalCombat',
                value: verbalCombat
            },
            {
                key: 'damage',
                value: {
                    formula: vcDamage
                }
            }
        ];
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
            let newItem = { ...addItem.toObject() };

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

    getAllLocations() {
        let locations = ['head', 'torso', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg'];

        if (this.type == 'monster' && this.system.hasTailWing) {
            locations.push('tailWing');
        }

        return locations;
    }

    getLocationObject(location) {
        let alias = '';
        let modifier = `+0`;
        let locationFormula;
        switch (location) {
            case 'randomHuman':
                let randomHumanLocation = getRandomInt(10);
                switch (randomHumanLocation) {
                    case 1:
                        location = 'head';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationHead')}`;
                        locationFormula = 3;
                        break;
                    case 2:
                    case 3:
                    case 4:
                        location = 'torso';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationTorso')}`;
                        locationFormula = 1;
                        break;
                    case 5:
                        location = 'rightArm';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationRight')} ${game.i18n.localize(
                            'WITCHER.Armor.LocationArm'
                        )}`;
                        locationFormula = 0.5;
                        break;
                    case 6:
                        location = 'leftArm';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationLeft')} ${game.i18n.localize(
                            'WITCHER.Armor.LocationArm'
                        )}`;
                        locationFormula = 0.5;
                        break;
                    case 7:
                    case 8:
                        location = 'rightLeg';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationRight')} ${game.i18n.localize(
                            'WITCHER.Armor.LocationLeg'
                        )}`;
                        locationFormula = 0.5;
                        break;
                    case 9:
                    case 10:
                        location = 'leftLeg';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationLeft')} ${game.i18n.localize(
                            'WITCHER.Armor.LocationLeg'
                        )}`;
                        locationFormula = 0.5;
                        break;
                    default:
                        location = 'torso';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationTorso')}`;
                        locationFormula = 1;
                        break;
                }
                break;
            case 'randomMonster':
                let randomMonsterLocation = getRandomInt(10);
                switch (randomMonsterLocation) {
                    case 1:
                        location = 'head';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationHead')}`;
                        locationFormula = 3;
                        break;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        location = 'torso';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationTorso')}`;
                        locationFormula = 1;
                        break;
                    case 6:
                    case 7:
                        location = 'rightLeg';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationRight')} ${game.i18n.localize(
                            'WITCHER.Dialog.attackLimb'
                        )}`;
                        locationFormula = 0.5;
                        break;
                    case 8:
                    case 9:
                        location = 'leftLeg';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationLeft')} ${game.i18n.localize(
                            'WITCHER.Dialog.attackLimb'
                        )}`;
                        locationFormula = 0.5;
                        break;
                    case 10:
                        location = 'tailWing';
                        alias = `${game.i18n.localize('WITCHER.Dialog.attackTail')}`;
                        locationFormula = 0.5;
                        break;
                    default:
                        location = 'torso';
                        alias = `${game.i18n.localize('WITCHER.Armor.LocationTorso')}`;
                        locationFormula = 1;
                        break;
                }
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
