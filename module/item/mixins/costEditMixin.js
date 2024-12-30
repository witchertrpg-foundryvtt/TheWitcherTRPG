export let costEditMixin = {
    attachHtmlListeners(callback, ...args) {
        const elements = Array.from(document.getElementsByClassName('component-cost'))
        elements.forEach(el => el.addEventListener('change', (_) => callback(this._calculateAdditionalCost(), ...args)))
    },

    _calculateAdditionalCost() {
        const totalPriceContainer = document.getElementById('total-price')
        const additionalCost = Array.from(document.getElementsByClassName('component-cost')).reduce((sum, el) => {
            const value = parseInt(el.value) ?? 0
            return sum + value
        }, 0)
        const initialPrice = parseInt(totalPriceContainer.getAttribute('data-price'))
        const newPrice = initialPrice + additionalCost

        totalPriceContainer.innerText = newPrice
        
        return additionalCost
    }
}