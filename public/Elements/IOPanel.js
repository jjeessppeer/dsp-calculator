class InputItemElement extends HTMLLIElement {
    get item() {
        return this.item_dropdown.item;
    }
    set item(item_id) {
        this.item_dropdown.img.src = items[item_id].icon;
        this.item_dropdown.item = item_id;
    }
    constructor() {
        super();
        this.classList.add('inputItem');
        this.innerHTML = `<button>x</button>`;
        this.querySelector('button').addEventListener('click', event => {
            this.remove();
            reloadResultsTable();
        });

        this.item_dropdown = document.createElement('div', { is: 'item-dropdown' });
        this.item_dropdown.addEventListener('item-selected', event => reloadResultsTable());
        this.querySelector(':scope > button').insertAdjacentElement('afterend', this.item_dropdown);
    }
}

class OutputItemElement extends HTMLLIElement {
    get rate() {
        let val = this.querySelectorAll("input")[1].value;
        return toNumber(val);
    }

    set rate(rate) {
        this.input.value = rate;
    }

    get item() {
        return this.item_dropdown.item;
    }

    set item(item_id) {
        this.item_dropdown.img.src = items[item_id].icon;
        this.item_dropdown.item = item_id;
    }

    constructor() {
        super();

        this.classList.add('outputItem');
        this.innerHTML = `
          <button>x</button>
          <label>Items/s</label>
          <input type="text" size="3" placeholder="0" value="1">
        `.trim();

        this.input = this.querySelector(':scope > input');
        this.querySelector(':scope > input').addEventListener('change', event => reloadResultsTable());
        this.querySelector("button").addEventListener('click', event => this.removeElement(event));


        this.item_dropdown = document.createElement('div', { is: 'item-dropdown' });
        this.item_dropdown.addEventListener('item-selected', event => reloadResultsTable());
        this.querySelector(':scope > button').insertAdjacentElement('afterend', this.item_dropdown);
    }

    removeElement(event) {
        this.remove();
        reloadResultsTable();
    }
}


customElements.define('output-item', OutputItemElement, { extends: 'li' });
customElements.define('input-item', InputItemElement, { extends: 'li' });