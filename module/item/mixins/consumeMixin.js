import { applyActiveEffectToActorViaId } from '../../scripts/activeEffects/applyActiveEffect.js';

const DialogV2 = foundry.applications.api.DialogV2;

export let consumeMixin = {
    async consume() {
        let properties = this.system.consumeProperties;
        let messageInfos = {};
        if (properties.doesHeal) {
            let heal = parseInt(await this.calculateHealValue(properties.heal));
            this.actor?.update({ 'system.derivedStats.hp.value': this.actor.system.derivedStats.hp.value + heal });
            messageInfos.heal = heal;
        }

        this.actor.applyStatus(properties.effects);
        this.removeEffects();
        let weapon = await applyActiveEffectToActorViaId(this.actor.uuid, this.uuid, 'applySelf');
        messageInfos.appliedToWeapon = weapon;
        this.applyTemporaryItemImprovements();
        this.createConsumeMessage(messageInfos);
    },

    async calculateHealValue(value) {
        let heal = value;
        if (value.includes && value.includes('d')) {
            heal = (await new Roll(value).evaluate()).total;
        }
        return parseInt(this.actor?.system.derivedStats.hp.value) + parseInt(heal) >
            this.actor?.system.derivedStats.hp.max
            ? parseInt(this.actor?.system.derivedStats.hp.max) - parseInt(this.actor?.system.derivedStats.hp.value)
            : heal;
    },

    async removeEffects() {
        this.actor.removeStatus(this.system.consumeProperties.removesEffects);
    },

    async applyTemporaryItemImprovements() {
        let temps = this.effects.filter(effect => effect.type === 'temporaryItemImprovement');
        if (!temps || temps.length == 0) return;

        let weapons = this.parent.items.filter(item => item.type === 'weapon');

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
            }
        });

        let weapon = weapons.find(weapon => weapon.id === itemId);
        temps = temps.map(temp => {
            return {
                ...temp.toObject(),
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

        return weapon;
    },

    async createConsumeMessage(messageInfos) {
        const messageTemplate = 'systems/TheWitcherTRPG/templates/chat/item/consume.hbs';

        let statusEffects = this.system.consumeProperties.effects.map(effect => {
            return {
                name: effect.name,
                statusEffect: CONFIG.WITCHER.statusEffects.find(configEffect => configEffect.id == effect.statusEffect)
            };
        });

        const content = await renderTemplate(messageTemplate, { item: this, messageInfos, statusEffects });
        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        ChatMessage.create(chatData);
    }
};
