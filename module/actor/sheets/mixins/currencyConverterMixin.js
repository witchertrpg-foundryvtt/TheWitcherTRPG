export let currencyConverterMixin = {
    currencyConverterListeners(html) {
        html.querySelectorAll('.open-currency-converter').forEach(button => {
            button.addEventListener('click', this.actor.handleCurrencyConverter.bind(this.actor));
        });
    }
};