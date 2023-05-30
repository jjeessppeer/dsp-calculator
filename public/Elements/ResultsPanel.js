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


    initializeItemRow(recepie_id, rate, recipes) {
        let recepie = recipes[recepie_id];
        this.recepie_id = recepie_id;

        // Populate input breakdown table
        for (const item_id in recepie.items_in) {
            let row = document.createElement('tr');
            let rate_in = recepie.items_in[item_id] * rate;
            row.innerHTML = `
          <td></td>
          <td><img src="`+ items[item_id].icon + `"></td>
          <td class="pad">&times;`+ math.format(rate_in, SETTINGS.format) + `</td>
          <td><img src="`+ items[belts[SETTINGS.belt].item].icon + `"></td>
          <td class="pad">&times;`+ math.format(rate_in / belts[SETTINGS.belt].speed, SETTINGS.format) + `</td>
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
            let power = p_a * Math.floor(n_machines) + p_i * (n_machines % 1);
            this.power = power;

            let is_input = false;
            document.querySelectorAll('#inputItems li:not(:last-child)').forEach(element => {
                if (element.item == item_id) is_input = true;
            });
            is_input = is_input ? ' is-input' : "";

            let recepie_img = recepie.icon != items[item_id].icon && recepie.type != "IMPORT" ? "<img src=" + recepie.icon + "><br>" : "";

            let row = document.createElement('tr');

            let link = setHashParam(window.location.href, "outputs", item_id + ',' + items_per_s);

            if (i == 0) {
                row.innerHTML += `
            <td rowspan="`+ length + `">
              <a href="`+ getHash(link) + `" target="_blank">
                  <svg viewBox="0 0 24 24"><use href="icons.svg#launch" /></svg>
              </a>
              <br>
              <button>
                <svg viewBox="25 0 24 24"><use href="icons.svg#arrow" /></svg>
              </button>
            </td>`;
            }

            row.innerHTML += `
          <td><img class="item-icon`+ is_input + `" src="` + items[item_id].icon + `" title="` + items[item_id].name + `"></td>
          <td class="pad">`+ math.format(items_per_s, SETTINGS.format) + `</td>
          <td><img src="`+ items[belts[SETTINGS.belt].item].icon + `"></td>
          <td class="pad">&times; `+ math.format(n_belts, SETTINGS.format) + `</td>`;

            // Add belt, machines, and power only for the first row. Row spans the full result row.
            if (i == 0) {
                this.querySelector('td').innerHTML = `
            
          `
                row.innerHTML += `
            <td rowspan="`+ length + `">` + recepie_img + `<img src="` + items[machine_item].icon + `"></td>
            <td rowspan="`+ length + `" class="pad">&times; ` + math.format(n_machines, SETTINGS.format) + `</td>
            <td rowspan="`+ length + `" class="pad proliferator-cell"></td>
            <td rowspan="`+ length + `">` + math.unit(power, 'kW').format(SETTINGS.format) + `</td>
          `

                let pc = row.querySelector('.proliferator-cell');
                let proliferator_dropdown = document.createElement('div', { is: 'proliferator-dropdown' });
                pc.appendChild(proliferator_dropdown)
            }
            // this.appendChild(row);
            this.insertBefore(row, this.querySelector('.subfactory-row'));
            this.querySelector('tr:nth-child(' + (i + 1) + ') .item-icon').addEventListener('click', event => {
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
    constructor() {
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
    constructor() {
        super();
        this.classList.add('subfactory-item-row')
        this.innerHTML = `
        <td>
        </td>  
      `
    }
}


customElements.define('result-row', ResultRowElement, { extends: 'tbody' });
customElements.define('subfactory-row', SubFactoryRow, { extends: 'tr' });