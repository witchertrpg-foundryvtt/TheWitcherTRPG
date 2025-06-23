export let healMixin = {
    async calculateHealValue(value) {
        let heal = value;
        if (value.includes && value.includes('d')) {
            heal = (await new Roll(value).evaluate()).total;
        }
        return parseInt(this.system.derivedStats.hp.value) + parseInt(heal) >
            this.system.derivedStats.hp.max
            ? parseInt(this.system.derivedStats.hp.max) - parseInt(this.system.derivedStats.hp.value)
            : heal;
    },

    async createHealMessage(heal) {
        const messageTemplate = 'systems/TheWitcherTRPG/templates/chat/combat/heal.hbs';

        const content = await renderTemplate(messageTemplate, { actor: this, heal });
        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        ChatMessage.create(chatData);
    }
};
