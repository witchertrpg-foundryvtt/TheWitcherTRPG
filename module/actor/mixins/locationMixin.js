import WitcherActor from '../witcherActor.js';

export let locationMixin = {
    getAllLocations() {
        return WitcherActor.getAllLocations();
    },

    getLocationObject(location) {
        return WitcherActor.getLocationObject(location);
    }
};
