import ChatMessageData from '../../../chatMessage/chatMessageData.js';
import { RollConfig } from '../../../scripts/rollConfig.js';
import { extendedRoll } from '../../../scripts/rolls/extendedRoll.js';

export let deathsaveMixin = {
    async _removeDeathSaves(event) {
        event.preventDefault();
        this.actor.update({ 'system.deathSaves': 0 });
    },

    async _addDeathSaves(event) {
        event.preventDefault();
        this.actor.update({ 'system.deathSaves': this.actor.system.deathSaves + 1 });
    },

    async _onDeathSaveRoll(event) {
        let stunBase =
            this.actor.system.derivedStats.hp.value > 0
                ? this.actor.system.derivedStats.stun.current
                : Math.floor((this.actor.system.stats.body.max + this.actor.system.stats.will.max) / 2);

        stunBase = Math.min(stunBase, 10);

        stunBase -= this.actor.system.deathSaves;

        let messageData = new ChatMessageData(
            this.actor,
            `
          <h2>${game.i18n.localize('WITCHER.DeathSave')}</h2>
          <div class="roll-summary">
              <div class="dice-formula">${game.i18n.localize('WITCHER.Chat.SaveText')} <b>${stunBase}</b></div>
          </div>
          <hr />`
        );

        let config = new RollConfig();
        config.reversal = true;
        config.showSuccess = true;
        config.showCrit = false;
        config.threshold = stunBase;

        await extendedRoll(`1d10`, messageData, config);
    },

    deathSaveListener(html) {
        html = $(html);
        html.find('.death-roll').on('click', this._onDeathSaveRoll.bind(this));
        html.find('.death-minus').on('click', this._removeDeathSaves.bind(this));
        html.find('.death-plus').on('click', this._addDeathSaves.bind(this));
    }
};
