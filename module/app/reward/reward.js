import { createLabeledInput } from '../htmlUtils.js';

const DialogV2 = foundry.applications.api.DialogV2;

export default class Rewards {
    static getPlayerActors() {
        return game.actors.filter(actor => actor.hasPlayerOwner);
    }

    static async rewardDialog() {
        let actors = this.getPlayerActors();

        let content = '';

        let options = [];
        actors.forEach(actor => {
            options.push({ value: actor.uuid, label: actor.name, selected: true });
        });

        const multiCheckboxes = foundry.applications.fields.createMultiSelectInput({
            type: 'checkboxes',
            name: 'actors',
            options: options
        });
        content += multiCheckboxes.outerHTML;

        game.i18n.localize('WITCHER.rewards.dialog.label');

        let labelDiv = document.createElement('div');

        labelDiv.appendChild(createLabeledInput(game.i18n.localize('WITCHER.rewards.dialog.label'), 'text', 'label'));
        content += labelDiv.outerHTML;

        let ipDiv = document.createElement('div');
        ipDiv.appendChild(createLabeledInput(game.i18n.localize('WITCHER.rewards.dialog.ip'), 'number', 'ip'));
        content += ipDiv.outerHTML;

        let values = await DialogV2.input({
            window: {
                title: `${game.i18n.localize('WITCHER.rewards.dialog.title')}`
            },
            content: content,
            ok: {
                label: `${game.i18n.localize('WITCHER.rewards.dialog.confirm')}`,
                icon: 'fa-solid fa-floppy-disk'
            }
        });

        return values;
    }

    static async handoutRewards() {
        if (!game.user.isGM) return;

        let values = await Rewards.rewardDialog();

        let actors = values.actors.map(actor => fromUuidSync(actor));
        let ip = values.ip;
        let label = values.label;

        if (ip) {
            actors.forEach(actor => actor.system.logs.addIpReward(label, ip));
        }

        const content = await renderTemplate('systems/TheWitcherTRPG/templates/chat/rewards.hbs', {
            actors: actors,
            label: label,
            ip: ip
        });
        const chatData = {
            content: content,
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        if (ip) {
            ChatMessage.create(chatData);
        }
    }
}
