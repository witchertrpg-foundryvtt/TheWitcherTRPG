import { createLabeledInput } from '../htmlUtils.js';

const DialogV2 = foundry.applications.api.DialogV2;

export default class Rewards {
    static getPlayerActors() {
        return game.actors.filter(actor => actor.hasPlayerOwner);
    }

    static async rewardDialog(actors) {
        if (!actors) {
            actors = this.getPlayerActors();
        }

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
        ipDiv.appendChild(
            createLabeledInput(game.i18n.localize('WITCHER.rewards.dialog.magicIp'), 'checkbox', 'isMagic')
        );
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

    static async handoutRewards(actors) {
        if (!game.user.isGM) return;

        let values = await Rewards.rewardDialog(actors);

        if (!values || !values.actors || values.actors.length === 0) return;

        let choosenActors = values.actors.map(actor => fromUuidSync(actor));
        let ip = values.ip;
        let label = values.label;

        if (ip) {
            choosenActors.forEach(actor => actor.system.logs.addIpReward(label, ip, values.isMagic));
        }

        const content = await renderTemplate('systems/TheWitcherTRPG/templates/chat/rewards.hbs', {
            actors: choosenActors,
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
