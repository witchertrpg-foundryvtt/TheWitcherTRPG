const fields = foundry.data.fields;

export function associatedItem(fieldName) {
    const field = {}
    field[fieldName] = new fields.StringField({initial: ''})

    return field
}

export function unwrapAssociatedItem(parent, idFieldName, fieldName) {
    let itemId = parent[idFieldName]
    if(itemId) {
        parent[fieldName] = fromUuidSync(itemId)
    }
}