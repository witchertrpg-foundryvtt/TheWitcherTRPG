export let adrenalineMixin = {
    async addAdrenaline() {
        if (game.settings.get('TheWitcherTRPG', 'useOptionalAdrenaline')) {
            this.update({ 'system.adrenaline.value': this.system.adrenaline.value + 1 });
        }
    }
};
