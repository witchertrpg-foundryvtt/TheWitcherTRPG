
export let criticalWoundMixin = {

    async _onCriticalWoundAdd(event) {
        event.preventDefault();
        const critList = this.actor.system.critWounds;
        critList.push({ id: foundry.utils.randomID() });
        this.actor.update({ "system.critWounds": critList });
    },

    async _onCriticalWoundRemove(event) {
        event.preventDefault();
        const prevCritList = this.actor.system.critWounds;
        const newCritList = Object.values(prevCritList).map((details) => details);
        const idxToRm = newCritList.findIndex((v) => v.id === event.target.dataset.id);
        newCritList.splice(idxToRm, 1);
        this.actor.update({ "system.critWounds": newCritList });
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

    criticalWoundListener(html) {
        html = $(html);
        html.find(".add-crit").on("click", this._onCriticalWoundAdd.bind(this));
        html.find(".delete-crit").on("click", this._onCriticalWoundRemove.bind(this));
        html.find('.critwound-display').on('click', this._onCritWoundDisplayInfo.bind(this));
    }

}