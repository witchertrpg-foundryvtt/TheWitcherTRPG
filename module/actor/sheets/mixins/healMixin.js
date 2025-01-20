const DialogV2 = foundry.applications.api.DialogV2;

export let healMixing = {
    async _onHeal() {
        const { actor } = this;
        const { rec } = actor.system.coreStats;
        const { hp, sta } = actor.system.derivedStats;
        const actualWoundList = actor.system.critWounds.length;

        let totalRec = Math.floor(rec.max / 2);

        const dialogData = {
            totalRec,
            actor,
            isResting: false,
            isSterilized: false,
            isHealingHand: false,
            isHealingTent: false,
            daysHealed: 1,
            actualWoundList: actualWoundList
        };

        await new DialogV2({
            window: { title: game.i18n.localize('WITCHER.Heal.dialogTitle') },
            content: await renderTemplate('systems/TheWitcherTRPG/templates/dialog/heal/heal-rest.hbs', dialogData),
            modal: true,
            buttons: [
                {
                    action: 'Heal',
                    label: game.i18n.localize('WITCHER.Heal.button'),
                    callback: async () => {
                        const isResting = document.querySelector('#R').checked;
                        const isSterilized = document.querySelector('#SF').checked;

                        await actor.update({
                            'system.derivedStats.hp.value': Math.min(hp.value + totalRec, hp.max),
                            'system.derivedStats.sta.value': sta.unmodifiedMax
                        });

                        const critList = Object.values(this.actor.system.critWounds).map(details => details);
                        let newCritList = [];
                        critList.forEach(crit => {
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
                            speaker: ChatMessage.getSpeaker({ actor: game.actors.getName(actor.name) }),
                            type: CONST.CHAT_MESSAGE_TYPES.IC
                        });

                        ui.notifications.info(
                            `${actor.name} ${game.i18n.localize('WITCHER.Heal.recovered')} ${isResting ? game.i18n.localize('WITCHER.Heal.restful') : game.i18n.localize('WITCHER.Heal.active')} ${game.i18n.localize('WITCHER.Heal.day')}`
                        );
                    }
                },
                {
                    action: 'Cancel',
                    label: game.i18n.localize('WITCHER.Button.Cancel'),
                    callback: () => {}
                }
            ]
        }).render({ force: true });

        const updateHealAmount = () => {
            const isResting = document.querySelector('#R').checked;
            const isSterilized = document.querySelector('#SF').checked;
            const isHealingHand = document.querySelector('#HH').checked;
            const isHealingTent = document.querySelector('#HT').checked;
            const sterilizedSection = document.querySelector('#sterilized-info');

            totalRec = Math.floor(rec.max / 2);

            if (isResting) {
                totalRec += rec.max;
                dialogData.isResting = true;
            }

            if (isSterilized) {
                totalRec += 2;
                dialogData.isSterilized = true;
                dialogData.daysHealed += 2;
            }

            if (isHealingHand) totalRec += 3;

            if (isHealingTent) totalRec += 2;

            dialogData.totalRec = totalRec;
            document.querySelector('#extra-info').textContent =
                `${game.i18n.localize('WITCHER.Heal.totalCure')} +${totalRec}`;

            sterilizedSection.classList.toggle('invisible', !isSterilized);
        };

        ['#R', '#SF', '#HH', '#HT'].forEach(id => {
            document.querySelector(id).addEventListener('change', updateHealAmount);
        });
    },

    healListeners(html) {
        html.find('.heal-button').on('click', this._onHeal.bind(this));
    }
};
