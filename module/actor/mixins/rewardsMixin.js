export let rewardsMixin = {
    async addReward() {
       game.api.rewards([this]);
    }
};
