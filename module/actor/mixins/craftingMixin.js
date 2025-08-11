export let craftingMixin = {
    getSubstance(name) {
        return this.getList('component').filter(
            i => i.system.type == 'substances' && i.system.substanceType == name && !i.system.isStored
        );
    },

    // Find needed component in the items list based on the component name or based on the exact name of the substance in the players compendium
    // Components in the diagrams are only string fields.
    // It is possible for diagram to have component which is actually the substance
    // That is why we need to check whether specific component name could be a substance
    // Ideally we need to store some flag (substances list for diagrams) to the diagram components
    // which will indicate whether the component is substance or not.
    // Such modification may require either modification dozens of compendiums, or some additional parsers
    findNeededComponent(componentName) {
        return this.items.filter(
            item =>
                item.type == 'component' &&
                (item.name == componentName ||
                    (item.system.type == 'substances' &&
                        ((game.i18n.localize('WITCHER.Inventory.Vitriol') == componentName &&
                            item.system.substanceType == 'vitriol') ||
                            (game.i18n.localize('WITCHER.Inventory.Rebis') == componentName &&
                                item.system.substanceType == 'rebis') ||
                            (game.i18n.localize('WITCHER.Inventory.Aether') == componentName &&
                                item.system.substanceType == 'aether') ||
                            (game.i18n.localize('WITCHER.Inventory.Quebrith') == componentName &&
                                item.system.substanceType == 'quebrith') ||
                            (game.i18n.localize('WITCHER.Inventory.Hydragenum') == componentName &&
                                item.system.substanceType == 'hydragenum') ||
                            (game.i18n.localize('WITCHER.Inventory.Vermilion') == componentName &&
                                item.system.substanceType == 'vermilion') ||
                            (game.i18n.localize('WITCHER.Inventory.Sol') == componentName &&
                                item.system.substanceType == 'sol') ||
                            (game.i18n.localize('WITCHER.Inventory.Caelum') == componentName &&
                                item.system.substanceType == 'caelum') ||
                            (game.i18n.localize('WITCHER.Inventory.Fulgur') == componentName &&
                                item.system.substanceType == 'fulgur'))))
        );
    },

    findComponentByUuid(uuid) {
        return this.getList('component').find(c => c?._stats.compendiumSource === uuid);
    }
};
