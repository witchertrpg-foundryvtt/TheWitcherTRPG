const DialogV2 = foundry.applications.api.DialogV2;

export let healMixin = {
    async _onHeal() {
        const rec = this.actor.system.coreStats.rec;
        const hp = this.actor.system.derivedStats.hp;
        const sta = this.actor.system.derivedStats.sta;
        const actualWoundList = this.actor.system.critWounds;

        let totalRec = Math.floor(rec.max / 2);

        const dialogData = {
            totalRec,
            actor: this.actor,
            isResting: false,
            isSterilized: false,
            isHealingHand: false,
            isHealingTent: false,
            daysHealed: 1,
            actualWoundList: actualWoundList.length
        };

        await new DialogV2({
            window: { title: game.i18n.localize('WITCHER.Heal.dialogTitle') },
            content: await renderTemplate('systems/TheWitcherTRPG/templates/dialog/heal/heal-rest.hbs', dialogData),
            modal: false,
            buttons: [
                {
                    action: 'heal',
                    label: game.i18n.localize('WITCHER.Heal.button'),
                    callback: async () => {
                        const isResting = document.querySelector('#resting').checked;
                        const isSterilized = document.querySelector('#sterilized').checked;

                        await this.recoverActor(
                            isResting,
                            isSterilized,
                            dialogData,
                            hp.value,
                            hp.max,
                            sta.unmodifiedMax
                        )
                    }
                },
                {
                    action: 'cancel',
                    label: game.i18n.localize('WITCHER.Button.Cancel'),
                    callback: () => {}
                }
            ]
        }).render({ force: true });

        this.restDialogListener(document, totalRec, rec, dialogData, actualWoundList)
    },

    async updateHealAmount(totalRec, rec, dialogData, actualWoundList) {
      const isResting = document.querySelector('#resting').checked;
      const isSterilized = document.querySelector('#sterilized').checked;
      const isHealingHand = document.querySelector('#healing-hand').checked;
      const isHealingTent = document.querySelector('#healing-tent').checked;

      totalRec = Math.floor(rec.max / 2);

      if (isResting) {
          totalRec = rec.max;
          dialogData.isResting = true;
      }

      if (isSterilized) {
          totalRec += 2;
          dialogData.isSterilized = true;

          if (actualWoundList.some(wound => !wound.sterilized)) {
            dialogData.daysHealed =+ 3;
          }
      }

      if (isHealingHand) totalRec += 3;

      if (isHealingTent) totalRec += 2;

      dialogData.totalRec = totalRec;
      document.querySelector('#extra-info').textContent =
          `${game.i18n.localize('WITCHER.Heal.totalRecover')} + ${totalRec}`;

      dialogData.sterilizedClass = isSterilized ? '' : 'invisible';
      document.querySelector('#sterilized-info').className = dialogData.sterilizedClass;
  },

    async recoverActor(isResting, isSterilized, dialogData, curHealth, maxHealth, unmodifiedMaxSta) {
        await this.actor.update({
          'system.derivedStats.hp.value': Math.min(curHealth + dialogData.totalRec, maxHealth),
          'system.derivedStats.sta.value': unmodifiedMaxSta
        });

        const clonedCritList = foundry.utils.deepClone(this.actor.system.critWounds)
        let newCritList = [];

        clonedCritList.forEach(crit => {
            crit.daysHealed += 1;
            if (isSterilized && !crit.sterilized) {
                crit.daysHealed += 2;
                crit.sterilized = true;
            }
            if (crit.healingTime <= 0 || crit.daysHealed < crit.healingTime) {
                newCritList.push(crit);
            }
        });

        this.actor.update({ 'system.critWounds': newCritList });

        ChatMessage.create({
            content: await renderTemplate(
                'systems/TheWitcherTRPG/templates/chat/heal/resting-status.hbs',
                dialogData
            ),
            speaker: ChatMessage.getSpeaker({ actor: game.actors.getName(this.actor.name) }),
            type: CONST.CHAT_MESSAGE_TYPES.IC
        });

        ui.notifications.info(
            `${this.actor.name} ${game.i18n.localize('WITCHER.Heal.recovered')} ${isResting ? game.i18n.localize('WITCHER.Heal.restful') : game.i18n.localize('WITCHER.Heal.active')} ${game.i18n.localize('WITCHER.Heal.day')}`
        );
    },

    healListeners(html) {
        html.find('.heal-button').on('click', this._onHeal.bind(this));
    },

    restDialogListener(document, totalRec, rec, dialogData, actualWoundList) {
        document.querySelector('#resting').addEventListener('change', () => this.updateHealAmount(totalRec, rec, dialogData, actualWoundList));
        document.querySelector('#sterilized').addEventListener('change', () => this.updateHealAmount(totalRec, rec, dialogData, actualWoundList));
        document.querySelector('#healing-hand').addEventListener('change', () => this.updateHealAmount(totalRec, rec, dialogData, actualWoundList));
        document.querySelector('#healing-tent').addEventListener('change', () => this.updateHealAmount(totalRec, rec, dialogData, actualWoundList));
    }
};
