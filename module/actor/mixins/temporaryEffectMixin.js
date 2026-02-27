const DialogV2 = foundry.applications.api.DialogV2;

export let temporaryEffectMixin = {
    async handleExpiredEffects() {
        let expiredEffects = this.effects.filter(effect => effect.duration.remaining === 0);

        let itemEffects = this.items
            .map(item => item.effects.contents)
            .flat()
            .filter(effect => effect.system.isTransferred && effect.duration.remaining === 0);

        itemEffects.forEach(effect => effect.delete());
        expiredEffects.forEach(effect => effect.delete());

        let tempHp = this.system.combatEffects.temporaryEffects.temporaryHp.filter(
            temp => temp.duration > 0 && temp.value > 0
        );
        await this.update({
            'system.combatEffects.temporaryEffects.temporaryHp': tempHp
        });
    },

    async tickdownEffects() {
        let tempHp = this.system.combatEffects.temporaryEffects.temporaryHp;
        tempHp.forEach(temp => (temp.duration = temp.duration - 1));
        await this.update({
            'system.combatEffects.temporaryEffects.temporaryHp': tempHp
        });
    },

    async applyTemporaryItemImprovements(effects) {
        let temps = effects.filter(effect => effect.type === 'temporaryItemImprovement');
        if (!temps || temps.length == 0) return;

        let weapons = this.items.filter(item => item.type === 'weapon');

        let options = '';
        weapons.forEach(
            weapon =>
                (options += `<option value="${weapon.id}" data-itemId="${weapon.itemId}"> ${weapon.name}</option>`)
        );

        let chooserContent = `<select name="choosen">${options}</select>`;
        let itemId = await DialogV2.prompt({
            window: { title: `` },
            content: chooserContent,
            ok: {
                callback: (event, button, dialog) => {
                    return button.form.elements.choosen.value;
                }
            },
            rejectClose: true
        });

        let weapon = weapons.find(weapon => weapon.id === itemId);
        temps = temps.map(temp => {
            return {
                //when sent via query it is already an object
                ...(temp.toObject?.() ?? temp),
                name: weapon.name + ' - ' + temp.name,
                origin: this.uuid,
                system: {
                    isTransferred: true
                },
                duration: {
                    ...temp.duration,
                    combat: ui.combat.combats.find(combat => combat.isActive)?.id
                }
            };
        });
        weapon.createEmbeddedDocuments('ActiveEffect', temps);

        const messageTemplate = 'systems/TheWitcherTRPG/templates/chat/item/appliedTemporaryItemImprovements.hbs';

        const content = await foundry.applications.handlebars.renderTemplate(messageTemplate, {
            item: weapon,
            temporaryItemImprovements: temps
        });
        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        ChatMessage.create(chatData);
    }
};
