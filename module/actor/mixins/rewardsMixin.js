export let rewardsMixin = {
    async addIpReward() {
        game.api.rewards.ip([this]);
    },

    async addCurrencyReward() {
        game.api.rewards.currency([this]);
    }
};
