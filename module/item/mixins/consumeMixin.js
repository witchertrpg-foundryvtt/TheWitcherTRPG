import { applyActiveEffectToActorViaId } from '../../scripts/temporaryEffects/applyActiveEffect.js';

export let consumeMixin = {
    async consume() {
        let properties = this.system.consumeProperties;
        let messageInfos = {};
        if (properties.doesHeal) {
            let heal = parseInt(await this.actor.calculateHealValue(properties.heal));
            this.actor?.update({ 'system.derivedStats.hp.value': this.actor.system.derivedStats.hp.value + heal });
            messageInfos.heal = heal;
        }

        if (properties.temporaryHp != '0') {
            let temporaryHp = properties.temporaryHp.value;
            if (temporaryHp.includes('d')) {
                temporaryHp = (await new Roll(temporaryHp).evaluate()).total;
            }
            let temporaryHpArray = this.actor.system.combatEffects.temporaryEffects.temporaryHp;
            if (!temporaryHpArray.find(temp => temp.source === this.uuid)) {
                temporaryHpArray.push({
                    duration: properties.temporaryHp.duration,
                    value: temporaryHp,
                    source: this.uuid
                });
                await this.actor.update({
                    'system.combatEffects.temporaryEffects.temporaryHp': temporaryHpArray
                });
                messageInfos.temporaryHp = { tempHp: temporaryHp, duration: properties.temporaryHp.duration };
            }
        }

        this.actor.applyStatus(properties.effects);
        this.actor.removeStatus(this.system.consumeProperties.removesEffects);
        applyActiveEffectToActorViaId(this.actor.uuid, this.uuid, 'applySelf');
        this.createConsumeMessage(messageInfos);
    },

    async createConsumeMessage(messageInfos) {
        const messageTemplate = 'systems/TheWitcherTRPG/templates/chat/item/consume.hbs';

        let statusEffects = this.system.consumeProperties.effects.map(effect => {
            return {
                name: effect.name,
                statusEffect: CONFIG.WITCHER.statusEffects.find(configEffect => configEffect.id == effect.statusEffect)
            };
        });

        const content = await foundry.applications.handlebars.renderTemplate(messageTemplate, {
            item: this,
            messageInfos,
            statusEffects
        });
        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        ChatMessage.create(chatData);
    }
};
