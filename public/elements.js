
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

  addIcon(img_src, icon_id, name="", category=0) {
    this.icons[icon_id] = {src: img_src, id: icon_id, name: name, category: category};
    
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
    this.querySelector(`.dropdown-content div:nth-of-type(${category+1})`).appendChild(img);

    // If it was the first icon added, select it but dont brodcast event. 
    if (Object.keys(this.icons).length == 1) {
      this.selectItem(icon_id, false);
    }
  }

  selectItem(icon_id, brodcast_event=true) {
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
    for (let i=0; i < proliferators.length; i++) {
      let p = proliferators[i];
      this.addIcon(items[p.item_id].icon, i, items[p.item_id].name, 0);
    }
    
    this.addEventListener('item-selected', event => {
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
    this.classList.add('item-row');

    this.innerHTML = `
      <tr class="subfactory-row">
        <td></td>
        <td colspan="4">
          <table>
          </table>
        </td>
      </tr>
    `;

  this.subfactory_table = this.querySelector('table');


  }


  initializeItemRow(recepie_id, rate) {
    let recepie = recepies[recepie_id];
    this.recepie_id = recepie_id;

    // Populate input breakdown table
    for (const item_id in recepie.items_in){
      let row = document.createElement('tr');
      let rate_in = recepie.items_in[item_id] * rate;
      row.innerHTML = `
        <td></td>
        <td><img src="`+items[item_id].icon+`"></td>
        <td class="pad">&times;`+math.format(rate_in, SETTINGS.format)+`</td>
        <td><img src="`+items[belts[SETTINGS.belt].item].icon+`"></td>
        <td class="pad">&times;`+math.format(rate_in/belts[SETTINGS.belt].speed, SETTINGS.format)+`</td>
      `;
      this.subfactory_table.appendChild(row);
    }

    // Add rows for item outputs and the recepie.
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

      let is_input = false;
      document.querySelectorAll('#inputItems li:not(:last-child)').forEach(element => {
        if (element.item == item_id) is_input = true;
      });
      is_input = is_input ? ' is-input' : "";

      let recepie_img = recepie.icon != items[item_id].icon && recepie.type != "IMPORT" ? "<img src="+recepie.icon+"><br>" : "";

      let row = document.createElement('tr');
    
      let link = setHashParam(window.location.href, "outputs", item_id + ',' + items_per_s);
      
      if (i == 0){
        row.innerHTML += `
          <td rowspan="`+length+`">
            <a href="`+getHash(link)+`" target="_blank">
                <svg viewBox="0 0 24 24"><use href="icons.svg#launch" /></svg>
            </a>
            <br>
            <button>
              <svg viewBox="25 0 24 24"><use href="icons.svg#arrow" /></svg>
            </button>
          </td>`;
      }

      row.innerHTML += `
        <td><img class="item-icon`+is_input+`" src="`+items[item_id].icon+`" title="`+items[item_id].name+`"></td>
        <td class="pad">`+math.format(items_per_s, SETTINGS.format)+`</td>
        <td><img src="`+items[belts[SETTINGS.belt].item].icon+`"></td>
        <td class="pad">&times; `+ math.format(n_belts, SETTINGS.format) + `</td>`;
      
      // Add belt, machines, and power only for the first row. Row spans the full result row.
      if (i == 0){
        this.querySelector('td').innerHTML = `
          
        `
        row.innerHTML += `
          <td rowspan="`+ length + `">`+recepie_img+`<img src="` + items[machine_item].icon + `"></td>
          <td rowspan="`+ length + `" class="pad">&times; ` + math.format(n_machines, SETTINGS.format) + `</td>
          <td rowspan="`+ length + `" class="pad proliferator-cell"></td>
          <td rowspan="`+ length + `">` + math.unit(power, 'kW').format(SETTINGS.format) + `</td>
        `
        
        let pc = row.querySelector('.proliferator-cell');
        let proliferator_dropdown = document.createElement('div', {is: 'proliferator-dropdown'});
        pc.appendChild(proliferator_dropdown)
      }
      // this.appendChild(row);
      this.insertBefore(row, this.querySelector('.subfactory-row'));
      this.querySelector('tr:nth-child('+(i+1)+') .item-icon').addEventListener('click', event => {
        toggleInputRow(item_id);
      });
      i++;
    }
    this.querySelector('button').addEventListener('click', event => {
      this.querySelector('button').classList.toggle('active');
      this.classList.toggle('show-breakdown');
    });
  }
}

class SubFactoryRow extends HTMLTableRowElement {
  constructor(){
    super();
    this.classList.add('subfactory-row')
    this.classList.add('active')
    this.innerHTML = `
      <td></td>
      <td>
        <table>
        <td><img src="icons/iron-ore.png"></td>
        <td class="pad">&times;1.5</td>
        <td><img src="icons/belt-1.png"></td>
        <td class="pad">&times;1.5</td>
        <td><img src="icons/assembler-1.png"></td>
        <td>&times;1.5</td>
        </table>
      </td>  
    `
  }
}

class SubFactoryItemRow extends HTMLTableRowElement {
  constructor(){
    super();
    this.classList.add('subfactory-item-row')
    this.innerHTML = `
      <td>
      </td>  
    `
  }
}


customElements.define('output-item', OutputItemElement, { extends: 'li' });
customElements.define('input-item', InputItemElement, { extends: 'li' });
customElements.define('result-row', ResultRowElement, { extends: 'tbody' });
customElements.define('subfactory-row', SubFactoryRow, { extends: 'tr' });
customElements.define('item-dropdown', ItemDropdown, { extends: 'div' });
customElements.define('icon-dropdown', IconDropdown, { extends: 'div' });
customElements.define('proliferator-dropdown', ProliferatorDropdown, { extends: 'div' });