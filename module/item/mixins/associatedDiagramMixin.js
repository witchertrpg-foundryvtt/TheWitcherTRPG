export let associatedDiagramMixin = {
    _addAssociatedDiagramListeners(html) {
        html.find(".remove-associated-diagram").on("click", this._onRemoveAssociatedDiagram.bind(this))
    },
    async _onRemoveAssociatedDiagram(event) {
        event.preventDefault()
        this.item.update({ 'system.associatedDiagramUuid': '' })
    },
    async _onDropDiagram(event, ...diagramTypes) {
        let dragEventData = TextEditor.getDragEventData(event)
        let item = await fromUuid(dragEventData.uuid)

        if (item) {
            if (event.target.offsetParent.dataset.type == "associatedDiagram") {
                if (item.type !== 'diagrams' || !diagramTypes.includes(item.system.type)) {
                    ui.notifications.warn(game.i18n.localize(`WITCHER.Repair.alerts.invalidDiagram`))
                } else {
                    this.item.update({ 'system.associatedDiagramUuid': item.uuid })
                }
            }
        }

    }
}
