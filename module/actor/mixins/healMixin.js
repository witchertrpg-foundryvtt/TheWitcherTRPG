export let healMixin = {
    async calculateHealValue(value) {
        let heal = value;
        if (value.includes && value.includes('d')) {
            heal = (await new Roll(value).evaluate()).total;
        }
        return parseInt(this.system.derivedStats.hp.value) + parseInt(heal) > this.system.derivedStats.hp.max
            ? parseInt(this.system.derivedStats.hp.max) - parseInt(this.system.derivedStats.hp.value)
            : heal;
    },

    async createHealMessage(heal) {
        const messageTemplate = 'systems/TheWitcherTRPG/templates/chat/combat/heal.hbs';

        const content = await foundry.applications.handlebars.renderTemplate(messageTemplate, { actor: this, heal });
        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        ChatMessage.create(chatData);
    },

    //returns if temporary health was added
    async addTemporaryHealth(healthValue, duration, uuid, skipMessage = true) {
        let temporaryHealth = healthValue;
        if (temporaryHealth.includes('d')) {
            temporaryHealth = (await new Roll(temporaryHealth).evaluate()).total;
        }

        let temporaryHpArray = this.system.combatEffects.temporaryEffects.temporaryHp;
        if (!temporaryHpArray.find(temp => temp.source === uuid)) {
            temporaryHpArray.push({
                duration: duration,
                value: temporaryHealth,
                source: uuid
            });

            await this.update({
                'system.combatEffects.temporaryEffects.temporaryHp': temporaryHpArray
            });

            if (!skipMessage) {
                const messageTemplate = 'systems/TheWitcherTRPG/templates/chat/heal/temporaryHealth.hbs';

                const content = await foundry.applications.handlebars.renderTemplate(messageTemplate, {
                    temporaryHp: {
                        duration,
                        temporaryHealth
                    }
                });
                const chatData = {
                    content: content,
                    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                    type: CONST.CHAT_MESSAGE_STYLES.OTHER
                };

                ChatMessage.create(chatData);
            }

            return true;
        }

        return false;
    }
};
