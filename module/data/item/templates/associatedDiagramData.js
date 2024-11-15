const fields = foundry.data.fields;

export function associatedDiagramUuid() {
    return {
        'associatedDiagramUuid': new fields.StringField({ initial: '' })
    }
}

export function unwrapAssociatedDiagram(parent) {
    const diagramId = parent.associatedDiagramUuid
    if (diagramId) {
        parent.associatedDiagram = fromUuidSync(diagramId)
    }
}