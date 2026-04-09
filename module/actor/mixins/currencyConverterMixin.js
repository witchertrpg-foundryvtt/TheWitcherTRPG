const DialogV2 = foundry.applications.api.DialogV2;

export const currencyConverterMixin = {
    async handleCurrencyConverter(event) {
        event.preventDefault();
        return this.openCurrencyConverter();
    },

    getCurrencyRates() {
        const rates = CONFIG.WITCHER.currencyRates;
        if (!rates) {
            throw new Error('Missing CONFIG.WITCHER.currencyRates');
        }
        return rates;
    },

    async openCurrencyConverter() {
        const excluded = new Set(CONFIG.WITCHER.currencyConverter?.excluded ?? []);
        const currencyKeys = Object.keys(CONFIG.WITCHER.currency).filter(key => !excluded.has(key));
        const options = currencyKeys.map(key => ({
            value: key,
            label: CONFIG.WITCHER.currency[key]
        }));

        const currencyData = this.system.currency;
        if (!currencyData) {
            throw new Error('Invalid actor: missing system.currency');
        }

        const currencies = currencyKeys.map(key => ({
            key,
            label: CONFIG.WITCHER.currency[key],
            value: currencyData[key]
        }));

        const content = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherTRPG/templates/sheets/actor/currencyConverter/currencyConverter.hbs',
            {
                options,
                currencies
            }
        );

        const values = await DialogV2.input({
            window: {
                title: `${game.i18n.localize('WITCHER.currencyConverter.title')}`
            },
            content,
            ok: {
                label: `${game.i18n.localize('WITCHER.currencyConverter.convert')}`,
                icon: 'fa-solid fa-arrows-rotate'
            }
        });

        if (!values) return;

        const amount = values.amount;
        const from = values.from;
        const to = values.to;
        const fee = values.fee;
        const feeRate = fee / 100;
        const rates = this.getCurrencyRates();
        const fromRate = Number(rates[from]);
        const toRate = Number(rates[to]);

        const currentFrom = Number(currencyData[from]);
        if (amount > currentFrom) {
            ui.notifications.warn(
                game.i18n.format('WITCHER.currencyConverter.errors.insufficient', {
                    currency: game.i18n.localize(CONFIG.WITCHER.currency[from])
                })
            );
            return;
        }

        const baseValue = amount * fromRate;
        const converted = baseValue / toRate;
        const afterFee = converted * (1 - feeRate);
        const rounded = Math.floor(afterFee);

        const newFrom = Math.max(0, currentFrom - amount);
        const newTo = Number(currencyData[to]) + rounded;

        await this.update({
            [`system.currency.${from}`]: newFrom,
            [`system.currency.${to}`]: newTo
        });

        const chatContent = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherTRPG/templates/chat/currency-conversion.hbs',
            {
                actor: this.name,
                amount: amount,
                from: CONFIG.WITCHER.currency[from],
                to: CONFIG.WITCHER.currency[to],
                fee: fee,
                result: rounded
            }
        );

        ChatMessage.create({
            content: chatContent,
            type: CONST.CHAT_MESSAGE_STYLES.OTHER,
            speaker: ChatMessage.getSpeaker({ actor: this })
        });
    }
};
