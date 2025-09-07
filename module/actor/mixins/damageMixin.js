import { getRandomInt } from '../../scripts/helper.js';
import { applyActiveEffectToActorViaId } from '../../scripts/activeEffects/applyActiveEffect.js';
import { applyStatusEffectToActor } from '../../scripts/statusEffects/applyStatusEffect.js';

export let damageMixin = {
    async applyDamage(dialogData, totalDamage, damageObject, derivedStat, infoTotalDmg = totalDamage) {
        let shield = this.system.derivedStats.shield.value;
        if (totalDamage < shield) {
            this.update({ 'system.derivedStats.shield.value': shield - totalDamage });
            let messageContent = `${game.i18n.localize('WITCHER.Damage.initial')}: <span class="error-display">${infoTotalDmg}</span><br />
                                ${game.i18n.localize('WITCHER.Damage.shield')}: <span class="error-display">${shield}</span><br />
                                ${game.i18n.localize('WITCHER.Damage.ToMuchShield')}
                                `;
            let messageData = {
                content: messageContent,
                speaker: ChatMessage.getSpeaker({ actor: this }),
                flags: this.getNoDamageFlags()
            };
            ChatMessage.applyRollMode(messageData, game.settings.get('core', 'rollMode'));
            ChatMessage.create(messageData);
            return;
        } else {
            this.update({ 'system.derivedStats.shield.value': 0 });
            totalDamage -= shield;
        }

        if (this.system.category && damageObject.properties?.oilEffect === this.system.category) {
            totalDamage += 5;
            infoTotalDmg += `+5[${game.i18n.localize('WITCHER.Damage.oil')}]`;
        }

        if (damageObject.properties.damageToAllLocations) {
            await this.applyDamageToAllLocations(dialogData, damageObject, totalDamage, infoTotalDmg, derivedStat);
        } else {
            await this.applyDamageToLocation(dialogData, damageObject, totalDamage, infoTotalDmg, derivedStat);
        }

        damageObject.properties.effects
            ?.filter(effect => effect.statusEffect)
            .filter(effect => effect.applied)
            .forEach(effect => applyStatusEffectToActor(this.uuid, effect.statusEffect, damageObject.duration));

        if (damageObject.itemUuid) {
            applyActiveEffectToActorViaId(this.uuid, damageObject.itemUuid, 'applyOnDamage', damageObject.duration);
        }
    },

    async applyDamageToLocation(dialogData, damageObject, totalDamage, infoTotalDmg, derivedStat) {
        let damageResult = await this.calculateDamageWithLocation(dialogData, damageObject, totalDamage, infoTotalDmg);

        if (damageResult.blockedBySp) {
            this.createDamageBlockedBySp(
                damageResult.infoTotalDmg,
                damageResult.displaySP,
                damageResult.infoAfterSPReduction
            );
            return;
        }

        this.createDamageResultMessage(damageResult);

        await this.update({
            [`system.derivedStats.${derivedStat}.value`]:
                this.system.derivedStats[derivedStat].value - Math.floor(damageResult.totalDamage)
        });
    },

    async applyDamageToAllLocations(dialogData, damage, totalDamage, infoTotalDmg, derivedStat) {
        let locations = this.getAllLocations().map(location => this.getLocationObject(location));

        let resultPromises = [];
        locations.forEach(location => {
            damage.location = location;

            resultPromises.push(this.calculateDamageWithLocation(dialogData, damage, totalDamage, infoTotalDmg));
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

        await this.update({
            [`system.derivedStats.${derivedStat}.value`]:
                this.system.derivedStats[derivedStat].value - totalAppliedDamage
        });
    },

    async calculateDamageWithLocation(enemyData, damage, totalDamage, infoTotalDmg) {
        let properties = damage.properties;
        let location = damage.location;

        let locationArmor = this.getLocationArmor(location, properties);
        let armorSet = locationArmor.armorSet;
        let totalSP = locationArmor.totalSP;
        let displaySP = locationArmor.displaySP;

        if (properties.improvedArmorPiercing) {
            totalSP = Math.ceil(totalSP / 2);
            displaySP = Math.ceil(displaySP / 2);
        }

        let silverDamage = 0;

        if (game.settings.get('TheWitcherTRPG', 'silverTrait')) {
            if (properties?.silverTrait) {
                silverDamage = totalDamage;
                totalDamage = 0;
            }
        } else {
            if (properties?.silverDamage && enemyData?.resistNonSilver) {
                let multi = damage.strike === 'strong' ? '*2' : '';
                let silverRoll = await new Roll(damage.properties.silverDamage + multi).evaluate();
                silverDamage = silverRoll.total;
                infoTotalDmg += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
            }
        }

        totalDamage -= totalSP < 0 ? 0 : totalSP;
        if (totalDamage < 0) {
            silverDamage = silverDamage + totalDamage > 0 ? silverDamage + totalDamage : 0;
        }

        let infoAfterSPReduction = totalDamage < 0 ? 0 : totalDamage;
        if (silverDamage) {
            infoAfterSPReduction += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
        }

        let spDamage = await this.applyAlwaysSpDamage(location, properties, armorSet);

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

        let flatDamageMod = this.getFlatDamageMod(damage);

        totalDamage = Math.max(Math.floor(location.locationFormula * totalDamage), 0);
        silverDamage = Math.max(Math.floor(location.locationFormula * silverDamage), 0);
        let infoAfterLocation = totalDamage;
        if (flatDamageMod) {
            infoAfterLocation += `+${location.locationFormula * flatDamageMod}[${game.i18n.localize('WITCHER.Damage.activeEffect')}]`;
        }

        if (silverDamage) {
            infoAfterLocation += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
        }

        totalDamage = this.calculateArmorResistances(totalDamage, damage, armorSet);

        let damageTypeConfig = CONFIG.WITCHER.damageTypes.find(type => type.value === damage.type);
        //Enemy is suspectible to silver
        if (
            (enemyData?.resistNonSilver && !properties?.silverDamage && !damageTypeConfig.likeSilver) ||
            (enemyData?.resistNonMeteorite && !properties?.isMeteorite && !damageTypeConfig.likeMeteorite)
        ) {
            totalDamage = Math.floor(0.5 * totalDamage);
        }

        //Enemy is not suspectible to silver
        if (
            game.settings.get('TheWitcherTRPG', 'silverTrait') &&
            !enemyData?.resistNonSilver &&
            properties.silverTrait
        ) {
            silverDamage = Math.floor(0.5 * silverDamage);
        }

        let infoAfterResistance = totalDamage;
        if (silverDamage) {
            totalDamage += silverDamage;
            infoAfterResistance += `+${silverDamage}[${game.i18n.localize('WITCHER.Damage.silver')}]`;
        }

        if (enemyData?.isVulnerable) {
            totalDamage *= 2;
            silverDamage *= 2;
        }

        spDamage += await this.applySpDamage(location, properties, armorSet);

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
    },

    async createDamageBlockedBySp(infoTotalDmg, displaySP, infoAfterSPReduction) {
        let messageContent = `${game.i18n.localize('WITCHER.Damage.initial')}: <span class="error-display">${infoTotalDmg}</span><br />
        ${game.i18n.localize('WITCHER.Damage.totalSP')}: <span class="error-display">${displaySP}</span><br />
        ${game.i18n.localize('WITCHER.Damage.afterSPReduct')} <span class="error-display">${infoAfterSPReduction}</span><br /><br />
        ${game.i18n.localize('WITCHER.Damage.NotEnough')}
        `;

        let messageData = {
            content: messageContent,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            flags: this.getNoDamageFlags()
        };

        let rollResult = await new Roll('1').evaluate();
        ChatMessage.applyRollMode(messageData, game.settings.get('core', 'rollMode'));
        rollResult.toMessage(messageData);
    },

    async createDamageResultMessage(damageResult) {
        const messageTemplate = 'systems/TheWitcherTRPG/templates/chat/damage/damageToLocation.hbs';

        const content = await renderTemplate(messageTemplate, damageResult);
        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            flags: this.getDamageFlags(),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));
        ChatMessage.create(chatData);
    },

    async applyCritDamage(crit) {
        this.applyDamage(
            null,
            crit.critdamage,
            {
                properties: { bypassesNaturalArmor: true, bypassesWornArmor: true },
                location: this.getLocationObject('torso')
            },
            'hp'
        );
    },

    async applyBonusCritDamage(crit) {
        this.applyDamage(
            null,
            crit.bonusdamage,
            {
                properties: { bypassesNaturalArmor: true, bypassesWornArmor: true },
                location: this.getLocationObject('torso')
            },
            'hp'
        );
    },

    async applyCritWound(crit) {
        let location = crit.location;
        let possibleWounds = [];

        for (let [woundName, woundConfig] of Object.entries(CONFIG.WITCHER.Crit)) {
            if (woundConfig.location.includes(location.name) && woundConfig.severity == crit.severity) {
                possibleWounds.push(woundName);
            }
        }

        let wound;

        if (possibleWounds.length == 1) {
            wound = possibleWounds[0];
        } else {
            let woundRoll = crit.location.critEffect ?? getRandomInt(6) + crit.critEffectModifier;
            if (woundRoll > 4) {
                wound = possibleWounds[0];
            } else {
                wound = possibleWounds[1];
            }
        }

        const critList = this.system.critWounds;
        critList.push({
            configEntry: wound,
            location: crit.location.name,
            healingTime: this.calculateHealingTime(crit.severity)
        });
        this.update({ 'system.critWounds': critList });

        const chatData = {
            content: `<div>${game.i18n.localize(CONFIG.WITCHER.Crit[wound].label)}</div><div>${game.i18n.localize(CONFIG.WITCHER.Crit[wound].description)}</div>`,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };
        ChatMessage.create(chatData);
    },

    calculateHealingTime(severity) {
        switch (severity) {
            case 'simple':
                return Math.max(8 - this.system.stats.body.max, 1);
            case 'complex':
                return Math.max(12 - this.system.stats.body.max, 1);
            case 'difficult':
                return Math.max(15 - this.system.stats.body.max, 1);
        }
    }
};
