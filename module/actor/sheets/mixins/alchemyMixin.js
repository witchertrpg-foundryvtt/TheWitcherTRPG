export let alchemyMixin = {
    _prepareAlchemyComponentsList(context) {
        return [
            { key: 'vitriol', label: 'Vitriol', image: 'vitriol.png', count: context.vitriolCount },
            { key: 'rebis', label: 'Rebis', image: 'rebis.png', count: context.rebisCount },
            { key: 'aether', label: 'Aether', image: 'aether.png', count: context.aetherCount },
            { key: 'quebrith', label: 'Quebrith', image: 'quebrith.png', count: context.quebrithCount },
            { key: 'hydragenum', label: 'Hydragenum', image: 'hydragenum.png', count: context.hydragenumCount },
            { key: 'vermilion', label: 'Vermilion', image: 'vermilion.png', count: context.vermilionCount },
            { key: 'sol', label: 'Sol', image: 'sol.png', count: context.solCount },
            { key: 'caelum', label: 'Caelum', image: 'caelum.png', count: context.caelumCount },
            { key: 'fulgur', label: 'Fulgur', image: 'fulgur.png', count: context.fulgurCount }
        ];
    }
}