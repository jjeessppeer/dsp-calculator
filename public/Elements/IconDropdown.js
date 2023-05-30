// Generic dropdown element where different icons can be selected.
// Each icon should have a unique identifier.
class IconDropdown extends HTMLDivElement {
    constructor() {
        super();
        this.classList.add('dropdown');
        this.innerHTML = `
        <div class="dropdown-content">
          <input type="text" placeholder="Search" style="display:none">
          <br style="display:none">
        </div>
        <img class="dropbtn" src="icons/rocket.png">
        `.trim();

        this.icons = {}
        this.selected_id = -1;
        this.dropbtn = this.querySelector(".dropbtn");
        this.dropbtn.addEventListener('click', event => this.toggleDropdown(event));
        this.search = this.querySelector("input");

    }

    addIcon(img_src, icon_id, name = "", category = 0) {
        this.icons[icon_id] = { src: img_src, id: icon_id, name: name, category: category };

        // Add category sections if missing
        let n_cats = this.querySelectorAll(".dropdown-content > div").length;
        while (n_cats < category + 1) {
            n_cats += 1;
            let div = document.createElement("div");
            this.querySelector(`.dropdown-content`).appendChild(div);
        }

        // Add the icon to the dropdown
        let img = document.createElement('img');
        img.src = img_src;
        img.title = name;
        img.dataset.item_id = icon_id;
        img.addEventListener('click', event => this.selectItem(event.target.dataset.item_id));
        this.querySelector(`.dropdown-content div:nth-of-type(${category + 1})`).appendChild(img);

        // If it was the first icon added, select it but dont brodcast event. 
        if (Object.keys(this.icons).length == 1) {
            this.selectItem(icon_id, false);
        }
    }

    selectItem(icon_id, brodcast_event = true) {
        this.dropbtn.src = this.icons[icon_id].src;
        this.selected_id = icon_id;
        if (!brodcast_event) return;
        this.dispatchEvent(new Event('item-selected'));
    }

    toggleDropdown(event) {
        this.classList.toggle('active')
        this.search.focus();
    }
}

class ProliferatorDropdown extends IconDropdown {
    constructor() {
        super();
        this.classList.add('proliferator-dropdown');

        // Add the proliferator icons
        for (let i = 0; i < proliferators.length; i++) {
            let p = proliferators[i];
            this.addIcon(items[p.item_id].icon, i, items[p.item_id].name, 0);
        }

        this.addEventListener('item-selected', event => {
            console.log("Proliferator changed");
            console.log(this.selected_id)
            reloadResultsTable();
        });
    }
}

class ItemDropdown extends HTMLDivElement {
    constructor() {
        super();

        this.classList.add('dropdown');
        this.innerHTML = `
        <div class="dropdown-content">
          <input type="text" placeholder="Search">
          <br>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <img class="dropbtn" src="">
        `.trim();
        let content = this.querySelector(".dropdown-content");
        for (const [key, item] of Object.entries(items)) {
            let img = document.createElement('img');
            img.src = item.icon;
            img.title = item.name;
            img.dataset.item_id = key
            img.addEventListener('click', event => this.selectItem(event.target.dataset.item_id));
            content.children[2 + ITEM_TYPES[item.type]].appendChild(img)
        }
        this.img = this.querySelector('.dropbtn');
        this.search = this.querySelector('input');
        this.querySelector(".dropbtn").addEventListener('click', event => this.toggleDropdown(event));
        this.selectItem(6001)
    }
    selectItem(item_id) {
        this.img.src = items[item_id].icon;
        this.item = item_id;
        this.dispatchEvent(new Event('item-selected'));
    }
    toggleDropdown(event) {
        this.classList.toggle('active')
        this.search.focus();
    }

}



customElements.define('item-dropdown', ItemDropdown, { extends: 'div' });
customElements.define('icon-dropdown', IconDropdown, { extends: 'div' });
customElements.define('proliferator-dropdown', ProliferatorDropdown, { extends: 'div' });