const dismantableItemTypes = ['weapon', 'armor'];

export let dismantlingMixin = {
    canBeDismantled() {
        return dismantableItemTypes.includes(this.type) && this.system.associatedDiagramUuid;
    },

    async dismantle() {
        let diagram = await fromUuid(this.system.associatedDiagramUuid);

        let components = diagram.system.craftingComponents.map(component => {
            return {
                name: component.name,
                uuid: component.uuid,
                //half of each type, minimum 1
                quantity: Math.max(1, Math.floor(component.quantity / 2))
            };
        });

        components = await Promise.all(
            components.map(async component => {
                if (component.uuid) {
                    let item = await fromUuid(component.uuid);

                    return {
                        item: item,
                        quantity: component.quantity
                    };
                }
                return component;
            })
        );

        let foundItems = components.filter(comp => comp.item);

        foundItems.forEach(comp => this.parent.addItem(comp.item, comp.quantity));

        this.parent.removeItem(this.id, 1);

        this.createDismantleMessage(components);

        return components;
    },

    async createDismantleMessage(components) {
        const messageTemplate = 'systems/TheWitcherTRPG/templates/chat/item/dismantle.hbs';

        let foundItems = components.filter(comp => comp.item);
        let unfoundItems = components.filter(comp => !comp.item);

        const content = await renderTemplate(messageTemplate, { item: this, foundItems, unfoundItems });
        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        ChatMessage.create(chatData);
    }
};
