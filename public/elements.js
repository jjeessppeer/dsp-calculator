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
  selectItem(item_id){
    this.img.src = items[item_id].icon;
    this.item = item_id;
    this.dispatchEvent(new Event('item-selected'));
  }
  toggleDropdown(event) {
    this.classList.toggle('active')
    this.search.focus();
  }
  
}

class InputItemElement extends HTMLLIElement {
  get item(){
    return this.item_dropdown.item;
  }
  set item(item_id){
    this.item_dropdown.img.src = items[item_id].icon;
    this.item_dropdown.item = item_id;
  }
  constructor(){
    super();
    this.classList.add('inputItem');
    this.innerHTML = `<button>x</button>`;
    this.querySelector('button').addEventListener('click', event => {
      this.remove();
      reloadResultsTable();
    });

    this.item_dropdown = document.createElement('div', {is: 'item-dropdown'});
    this.item_dropdown.addEventListener('item-selected', event => reloadResultsTable());
    this.querySelector(':scope > button').insertAdjacentElement('afterend', this.item_dropdown);
  }
}

class OutputItemElement extends HTMLLIElement {
  get rate() {
    let val = this.querySelectorAll("input")[1].value;
    return toNumber(val);
  }

  set rate(rate){
    this.input.value = rate;
  }

  get item(){
    return this.item_dropdown.item;
  }

  set item(item_id){
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


    this.item_dropdown = document.createElement('div', {is: 'item-dropdown'});
    this.item_dropdown.addEventListener('item-selected', event => reloadResultsTable());
    this.querySelector(':scope > button').insertAdjacentElement('afterend', this.item_dropdown);
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
    this.recepie_id = recepie_id;

    let length = Object.keys(recepie.items_out).length;
    let i = 0;
    for (const item_id in recepie.items_out) {

      let items_per_s = recepie.items_out[item_id] * rate;
      if (item_id in recepie.items_in) items_per_s -= recepie.items_in[item_id] * rate;
      if (items_per_s <= 0) continue;
      let n_belts = items_per_s / belts[SETTINGS.belt].speed;

      let machine_item = machines[recepie.type].buildings[SETTINGS.machines[recepie.type]];
      let machine_speed = machines[recepie.type].speeds[SETTINGS.machines[recepie.type]] * 60;

      let n_machines = rate * recepie.time / machine_speed;
      if (document.querySelector('#machineCeilCheck').checked) n_machines = Math.ceil(n_machines);
      let p_a = machines[recepie.type].powers[SETTINGS.machines[recepie.type]].active;
      let p_i = machines[recepie.type].powers[SETTINGS.machines[recepie.type]].idle;
      let power = p_a * Math.floor(n_machines) + p_i * (n_machines%1);
      this.power = power;
      power = formatNumber(power, 0);

      let is_input = false;
      document.querySelectorAll('#inputItems li:not(:last-child)').forEach(element => {
        if (element.item == item_id) is_input = true;
      });
      is_input = is_input ? 'class="is-input"' : "";

      let recepie_img = recepie.icon != items[item_id].icon && recepie.type != "IMPORT" ? "<img src="+recepie.icon+"><br>" : "";

      let row = document.createElement('tr');
      // <svg><use href="launch-24px.svg" /></svg>

    
      let link = setHashParam(window.location.href, "outputs", item_id + ',' + items_per_s);
      
      row.innerHTML = `
        <td>
          <a href="`+getHash(link)+`" target="_blank">
          <svg viewBox="0 0 24 24">
          <use href="icon.svg#launch" />
          </svg>
          </a>
        </td>
        <td><img src="`+items[item_id].icon+`" title="`+items[item_id].name+`" `+is_input+`></td>
        <td class="pad">`+formatNumber(items_per_s)+`</td>
        <td><img src="`+items[belts[SETTINGS.belt].item].icon+`"></td>
        <td class="pad">&times; `+ formatNumber(n_belts) + `</td>`;
      
      // Add belt, machines, and power only for the first row. Row spans the full result row.
      if (this.childNodes.length == 0){
        row.innerHTML += `
          <td rowspan="`+ length + `">`+recepie_img+`<img src="` + items[machine_item].icon + `"></td>
          <td rowspan="`+ length + `" class="pad">&times; ` + formatNumber(n_machines) + `</td>
          <td rowspan="`+ length + `">` + math.unit(power, 'kW').toString() + `</td>
        `
      }
      this.appendChild(row);
      this.querySelector('tr:nth-child('+(i+1)+') > td:nth-child(2) > img').addEventListener('click', event => {
        toggleInputRow(item_id);
      });
      i++;
    }
  }
}


customElements.define('output-item', OutputItemElement, { extends: 'li' });
customElements.define('input-item', InputItemElement, { extends: 'li' });
customElements.define('result-row', ResultRowElement, { extends: 'tbody' });
customElements.define('item-dropdown', ItemDropdown, { extends: 'div' });