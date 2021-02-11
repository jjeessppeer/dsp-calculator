class InputItemElement extends HTMLLIElement {

  get rate() {
    let val = this.querySelectorAll("input")[1].value;
    if (val) return Number(val);
    return 0;
  }

  constructor() {
    super();

    this.classList.add('outputItem')
    this.innerHTML = `
        <button>x</button>
        <div class="dropdown">
          <div class="dropdown-content">
            <input type="text" placehoder="Search">
            <br>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <img class="dropbtn" src="item_images/iron-plate.png">
        </div>
        <label>Items/s</label>
        <input type="text" size="3" placeholder="0" value="1">
      `.trim();

    let content = this.querySelector(".dropdown-content");
    for (const [key, item] of Object.entries(items)) {
      let img = document.createElement('img');
      img.src = item.icon;
      img.title = item.name;
      img.dataset.item_id = key
      img.addEventListener('click', (event) => this.selectItem(event.target.dataset.item_id));
      content.children[2 + ITEM_TYPES[item.type]].appendChild(img)
    }

    this.search = this.querySelector('input');
    this.img = this.querySelector('.dropbtn');
    this.querySelector(".dropbtn").addEventListener('click', (event) => this.toggleDropdown(event));
    this.querySelector("button").addEventListener('click', (event) => this.removeElement(event));

    this.selectItem(6001);
  }
  toggleDropdown(event) {
    // event.target.parentNode.classList.toggle('active');
    event.target.parentNode.classList.toggle('active');
    this.search.focus();
  }

  selectItem(item_id) {
    this.img.src = items[item_id].icon;
    this.item = item_id;
    reloadResultsTable();
  }

  removeElement(event) {
    this.remove();
    reloadResultsTable();
  }
}

class ResultRowElement extends HTMLTableSectionElement {

  constructor() {
    super();
    this.classList.add('item-row')
  }

  initializeItemRow(recepie_id, rate) {
    let recepie = recepies[recepie_id];

    let length = Object.keys(recepie.items_out).length;
    let i = 0;
    for (const item_id in recepie.items_out) {

      let items_per_s = recepie.items_out[item_id] * rate;
      if (item_id in recepie.items_in) items_per_s -= recepie.items_in[item_id] * rate;
      if (items_per_s <= 0) continue;
      // items_per_s = items_per_s
      let n_belts = items_per_s / belts[SETTINGS.belt].speed;

      let machine_item = machines[recepie.type].buildings[SETTINGS.machines[recepie.type]]
      let machine_speed = machines[recepie.type].speeds[SETTINGS.machines[recepie.type]] * 60

      let n_machines = rate * recepie.time / machine_speed;
      let power = machines[recepie.type].powers[SETTINGS.machines[recepie.type]].active * n_machines
      power = formatNumber(power, 0);

      if (i == 0) {
        this.innerHTML += `
            <tr>
              <td><img src="`+items[item_id].icon+`" title="` + items[item_id].name + `"></td>
              <td class="pad">`+ formatNumber(items_per_s) + `</td>
              <td><img src="`+ items[belts[SETTINGS.belt].item].icon + `"></td>
              <td class="pad">&times; `+ formatNumber(n_belts) + `</td>
              <td rowspan="`+ length + `"><img src="` + items[machine_item].icon + `"></td>
              <td rowspan="`+ length + `" class="pad">&times; ` + formatNumber(n_machines) + `</td>
              <td rowspan="`+ length + `">` + math.unit(power, 'kW').toString() + `</td>
            </tr>`;
      }
      else {
        this.innerHTML += `
            <tr>
              <td><img src="`+ items[item_id].icon + `" title="` + items[item_id].name + `"></td>
              <td class="pad">`+ formatNumber(items_per_s) + `</td>
              <td><img src="`+ items[belts[SETTINGS.belt].item].icon + `"></td>
              <td class="pad">&times; `+ formatNumber(n_belts) + `</td>
            </tr>`;
      }
      i++;
    }
  }
}


customElements.define('input-item', InputItemElement, { extends: 'li' });
customElements.define('result-row', ResultRowElement, { extends: 'tbody' });