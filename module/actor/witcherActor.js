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
    }

    updateDerived() {
        const stats = this.system.stats;
        const base = Math.floor((stats.body.current + stats.will.current) / 2);
        const baseMax = Math.floor((stats.body.max + stats.will.max) / 2);
        const meleeBonus = Math.ceil((stats.body.current - 6) / 2) * 2;

        let intTotalModifiers = this.getAllModifiers('int').totalModifiers;
        let refTotalModifiers = this.getAllModifiers('ref').totalModifiers;
        let dexTotalModifiers = this.getAllModifiers('dex').totalModifiers;
        let bodyTotalModifiers = this.getAllModifiers('body').totalModifiers;
        let spdTotalModifiers = this.getAllModifiers('spd').totalModifiers;
        let empTotalModifiers = this.getAllModifiers('emp').totalModifiers;
        let craTotalModifiers = this.getAllModifiers('cra').totalModifiers;
        let willTotalModifiers = this.getAllModifiers('will').totalModifiers;
        let luckTotalModifiers = this.getAllModifiers('luck').totalModifiers;
        let toxTotalModifiers = this.getAllModifiers('toxicity').totalModifiers;
        let intDivider = this.getAllModifiers('int').totalDivider;
        let refDivider = this.getAllModifiers('ref').totalDivider;
        let dexDivider = this.getAllModifiers('dex').totalDivider;
        let bodyDivider = this.getAllModifiers('body').totalDivider;
        let spdDivider = this.getAllModifiers('spd').totalDivider;
        let empDivider = this.getAllModifiers('emp').totalDivider;
        let craDivider = this.getAllModifiers('cra').totalDivider;
        let willDivider = this.getAllModifiers('will').totalDivider;
        let luckDivider = this.getAllModifiers('luck').totalDivider;
        this.system.stats.int.modifiers.forEach(item => (intTotalModifiers += Number(item.value)));
        this.system.stats.ref.modifiers.forEach(item => (refTotalModifiers += Number(item.value)));
        this.system.stats.dex.modifiers.forEach(item => (dexTotalModifiers += Number(item.value)));
        this.system.stats.body.modifiers.forEach(item => (bodyTotalModifiers += Number(item.value)));
        this.system.stats.spd.modifiers.forEach(item => (spdTotalModifiers += Number(item.value)));
        this.system.stats.emp.modifiers.forEach(item => (empTotalModifiers += Number(item.value)));
        this.system.stats.cra.modifiers.forEach(item => (craTotalModifiers += Number(item.value)));
        this.system.stats.will.modifiers.forEach(item => (willTotalModifiers += Number(item.value)));
        this.system.stats.luck.modifiers.forEach(item => (luckTotalModifiers += Number(item.value)));
        this.system.stats.toxicity.modifiers.forEach(item => (toxTotalModifiers += Number(item.value)));

        let stunTotalModifiers = this.getAllModifiers('stun').totalModifiers;
        let runTotalModifiers = this.getAllModifiers('run').totalModifiers;
        let leapTotalModifiers = this.getAllModifiers('leap').totalModifiers;
        let encTotalModifiers = this.getAllModifiers('enc').totalModifiers;
        let recTotalModifiers = this.getAllModifiers('rec').totalModifiers;
        let wtTotalModifiers = this.getAllModifiers('woundTreshold').totalModifiers;
        let stunDivider = this.getAllModifiers('stun').totalDivider;
        let runDivider = this.getAllModifiers('run').totalDivider;
        let leapDivider = this.getAllModifiers('leap').totalDivider;
        let encDivider = this.getAllModifiers('enc').totalDivider;
        let recDivider = this.getAllModifiers('rec').totalDivider;
        let wtDivider = this.getAllModifiers('woundTreshold').totalDivider;
        this.system.coreStats.stun.modifiers.forEach(item => (stunTotalModifiers += Number(item.value)));
        this.system.coreStats.run.modifiers.forEach(item => (runTotalModifiers += Number(item.value)));
        this.system.coreStats.leap.modifiers.forEach(item => (leapTotalModifiers += Number(item.value)));
        this.system.coreStats.enc.modifiers.forEach(item => (encTotalModifiers += Number(item.value)));
        this.system.coreStats.rec.modifiers.forEach(item => (recTotalModifiers += Number(item.value)));
        this.system.coreStats.woundTreshold.modifiers.forEach(item => (wtTotalModifiers += Number(item.value)));

        let curentEncumbrance = (this.system.stats.body.max + bodyTotalModifiers) * 10 + encTotalModifiers;
        var totalWeights = this.getTotalWeight();

        let encDiff = 0;
        if (curentEncumbrance < totalWeights) {
            encDiff = Math.ceil((totalWeights - curentEncumbrance) / 5);
        }
        let armorEnc = this.getArmorEcumbrance();

        let curInt = Math.floor((this.system.stats.int.max + intTotalModifiers) / intDivider);
        let curRef = Math.floor((this.system.stats.ref.max + refTotalModifiers - armorEnc - encDiff) / refDivider);
        let curDex = Math.floor((this.system.stats.dex.max + dexTotalModifiers - armorEnc - encDiff) / dexDivider);
        let curBody = Math.floor((this.system.stats.body.max + bodyTotalModifiers) / bodyDivider);
        let curSpd = Math.floor((this.system.stats.spd.max + spdTotalModifiers - encDiff) / spdDivider);
        let curEmp = Math.floor((this.system.stats.emp.max + empTotalModifiers) / empDivider);
        let curCra = Math.floor((this.system.stats.cra.max + craTotalModifiers) / craDivider);
        let curWill = Math.floor((this.system.stats.will.max + willTotalModifiers) / willDivider);
        let curLuck = Math.floor((this.system.stats.luck.max + luckTotalModifiers) / luckDivider);
        let curTox = this.system.stats.toxicity.max + toxTotalModifiers;
        let isDead = false;
        let isWounded = false;
        let HPvalue = this.system.derivedStats.hp.value;
        if (HPvalue <= 0) {
            isDead = true;
            curInt = Math.floor((this.system.stats.int.max + intTotalModifiers) / 3 / intDivider);
            curRef = Math.floor((this.system.stats.ref.max + refTotalModifiers - armorEnc - encDiff) / 3 / dexDivider);
            curDex = Math.floor((this.system.stats.dex.max + dexTotalModifiers - armorEnc - encDiff) / 3 / refDivider);
            curBody = Math.floor((this.system.stats.body.max + bodyTotalModifiers) / 3 / bodyDivider);
            curSpd = Math.floor((this.system.stats.spd.max + spdTotalModifiers - encDiff) / 3 / spdDivider);
            curEmp = Math.floor((this.system.stats.emp.max + empTotalModifiers) / 3 / empDivider);
            curCra = Math.floor((this.system.stats.cra.max + craTotalModifiers) / 3 / craDivider);
            curWill = Math.floor((this.system.stats.will.max + willTotalModifiers) / 3 / willDivider);
            curLuck = Math.floor((this.system.stats.luck.max + luckTotalModifiers) / 3 / luckDivider);
        } else if (HPvalue < this.system.coreStats.woundTreshold.current > 0) {
            isWounded = true;
            curRef = Math.floor((this.system.stats.ref.max + refTotalModifiers - armorEnc - encDiff) / 2 / refDivider);
            curDex = Math.floor((this.system.stats.dex.max + dexTotalModifiers - armorEnc - encDiff) / 2 / dexDivider);
            curInt = Math.floor((this.system.stats.int.max + intTotalModifiers) / 2 / intDivider);
            curWill = Math.floor((this.system.stats.will.max + willTotalModifiers) / 2 / willDivider);
        }

        let hpTotalModifiers = this.getAllModifiers('hp').totalModifiers;
        let staTotalModifiers = this.getAllModifiers('sta').totalModifiers;
        let resTotalModifiers = this.getAllModifiers('resolve').totalModifiers;
        let focusTotalModifiers = this.getAllModifiers('focus').totalModifiers;
        let vigorModifiers = this.getAllModifiers('vigor').totalModifiers;
        let hpDivider = this.getAllModifiers('hp').totalDivider;
        let staDivider = this.getAllModifiers('sta').totalDivider;
        this.system.derivedStats.hp.modifiers.forEach(item => (hpTotalModifiers += Number(item.value)));
        this.system.derivedStats.sta.modifiers.forEach(item => (staTotalModifiers += Number(item.value)));
        this.system.derivedStats.resolve.modifiers.forEach(item => (resTotalModifiers += Number(item.value)));
        this.system.derivedStats.focus.modifiers.forEach(item => (focusTotalModifiers += Number(item.value)));

        let curHp = this.system.derivedStats.hp.max + hpTotalModifiers;
        let curSta = this.system.derivedStats.sta.max + staTotalModifiers;
        let curRes = this.system.derivedStats.resolve.max + resTotalModifiers;
        let curFocus = this.system.derivedStats.focus.max + focusTotalModifiers;
        let curVigor = this.system.derivedStats.vigor.unmodifiedMax + vigorModifiers;

        let unmodifiedMaxHp = baseMax * 5;

        if (this.system.customStat != true) {
            curHp = Math.floor((base * 5 + hpTotalModifiers) / hpDivider);
            curSta = Math.floor((base * 5 + staTotalModifiers) / staDivider);
            curTox = Math.floor(100 + toxTotalModifiers);
            curRes = Math.floor((curWill + curInt) / 2) * 5 + resTotalModifiers;
            curFocus = Math.floor((curWill + curInt) / 2) * 3 + focusTotalModifiers;
        }

        this.update({
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
            'system.stats.toxicity.max': curTox,

            'system.stats.int.totalModifiers': intTotalModifiers,
            'system.stats.ref.totalModifiers': refTotalModifiers,
            'system.stats.dex.totalModifiers': dexTotalModifiers,
            'system.stats.body.totalModifiers': bodyTotalModifiers,
            'system.stats.spd.totalModifiers': spdTotalModifiers,
            'system.stats.emp.totalModifiers': empTotalModifiers,
            'system.stats.cra.totalModifiers': craTotalModifiers,
            'system.stats.will.totalModifiers': willTotalModifiers,
            'system.stats.luck.totalModifiers': luckTotalModifiers,

            'system.derivedStats.hp.max': curHp,
            'system.derivedStats.hp.unmodifiedMax': unmodifiedMaxHp,
            'system.derivedStats.sta.max': curSta,
            'system.derivedStats.resolve.max': curRes,
            'system.derivedStats.focus.max': curFocus,
            'system.derivedStats.vigor.max': curVigor,

            'system.coreStats.stun.current': Math.floor((Math.clamp(base, 1, 10) + stunTotalModifiers) / stunDivider),
            'system.coreStats.stun.max': Math.clamp(baseMax, 1, 10),
            'system.coreStats.stun.totalModifiers': stunTotalModifiers,

            'system.coreStats.enc.current': Math.floor((stats.body.current * 10 + encTotalModifiers) / encDivider),
            'system.coreStats.enc.max': stats.body.current * 10,
            'system.coreStats.enc.totalModifiers': encTotalModifiers,

            'system.coreStats.run.current': Math.floor((stats.spd.current * 3 + runTotalModifiers) / runDivider),
            'system.coreStats.run.max': stats.spd.current * 3,
            'system.coreStats.run.totalModifiers': runTotalModifiers,

            'system.coreStats.leap.current': Math.floor((stats.spd.current * 3) / 5 + leapTotalModifiers) / leapDivider,
            'system.coreStats.leap.max': Math.floor((stats.spd.max * 3) / 5),
            'system.coreStats.leap.totalModifiers': leapTotalModifiers,

            'system.coreStats.rec.current': Math.floor((base + recTotalModifiers) / recDivider),
            'system.coreStats.rec.max': baseMax,
            'system.coreStats.rec.totalModifiers': recTotalModifiers,

            'system.coreStats.woundTreshold.current': Math.floor((baseMax + wtTotalModifiers) / wtDivider),
            'system.coreStats.woundTreshold.max': baseMax,
            'system.coreStats.woundTreshold.totalModifiers': wtTotalModifiers,

            'system.attackStats.meleeBonus': meleeBonus,
            'system.attackStats.punch.value': `1d6+${meleeBonus}`,
            'system.attackStats.kick.value': `1d6+${4 + meleeBonus}`
        });
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

        relevantModifier.forEach(modifier => (encumbranceModifier += parseInt(modifier.formula)));

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
