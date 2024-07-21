export let noteMixin = {

  async _onNoteAdd() {
    let notes = this.actor.system.notes
    notes.push({
      title: '',
      details: ''
    })
    this.actor.update({ "system.notes": notes });
  },

  async _onNoteDelete(event) {
    let noteIndex = event.currentTarget.dataset.noteIndex;
    let notes = this.actor.system.notes
    notes.splice(noteIndex, 1)
    this.actor.update({ "system.notes": notes });
  },

  noteListener(html) {
    html.find(".add-note").on("click", this._onNoteAdd.bind(this));
    html.find(".delete-note").on("click", this._onNoteDelete.bind(this));
  }

}