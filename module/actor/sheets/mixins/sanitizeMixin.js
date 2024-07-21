export let sanitizeMixin = {
  // Helping functions
  /** Sanitizes description if it contains forbidden html tags. */
  sanitizeDescription(item) {
    if (!item.system.description) {
      return item;
    }

    const regex = /(<.+?>)/g;
    const whiteList = ["<p>", "</p>"];
    const tagsInText = item.system.description.match(regex);
    const itemCopy = JSON.parse(JSON.stringify(item));
    if (tagsInText.some(i => !whiteList.includes(i))) {
      const temp = document.createElement('div');
      temp.textContent = itemCopy.system.description;
      itemCopy.system.description = temp.innerHTML;
    }
    return itemCopy;
  }
}