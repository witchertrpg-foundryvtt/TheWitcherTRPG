export let criticalWoundMixin = {
    async _onCriticalWoundAdd(event) {
        event.preventDefault();
        this.actor.createEmbeddedDocuments('Item', [
            {
                name: game.i18n.localize('TYPES.Item.criticalWound'),
                type: 'criticalWound'
            }
        ]);
    },

    async _onCriticalWoundRemove(event) {
        event.preventDefault();
        const prevCritList = this.actor.system.critWounds;
        const newCritList = Object.values(prevCritList).map(details => details);
        const idxToRm = newCritList.findIndex(v => v.id === event.target.dataset.id);
        newCritList.splice(idxToRm, 1);
        this.actor.update({ 'system.critWounds': newCritList });
    },

    async _onCritWoundDisplayInfo(event) {
        event.preventDefault();
        event.stopPropagation();
        let section = event.currentTarget.closest('.critwound');
        let editor = $(section).find('.critwounds-description');
        editor.toggleClass('invisible');
        let icon = $(event.currentTarget).find('i');
        if (icon.hasClass('fa-chevron-up')) {
            icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
        } else {
            icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
        }
    },

    async _onTreat(event) {
        event.preventDefault();

        const crit = fromUuidSync(event.target.dataset.id);
        crit.system.treat();
    },

    criticalWoundListener(html) {
        let jquery = $(html);

        jquery.find('.add-crit').on('click', this._onCriticalWoundAdd.bind(this));
        jquery.find('.delete-crit').on('click', this._onCriticalWoundRemove.bind(this));
        jquery.find('.critwound-display').on('click', this._onCritWoundDisplayInfo.bind(this));

        html.querySelectorAll('[data-action=treatCriticalWound]').forEach(crit =>
            crit.addEventListener('click', event => this._onTreat(event))
        );
    }
};
