export function createLabeledInput(title, type, name) {
        let label = document.createElement('label');
        label.style = 'display: flex; gap: 10px; align-items: center';
        label.innerHTML = title;

        let input = document.createElement('input');
        input.type = type;
        input.name = name;
        label.appendChild(input);
        return label;
    }