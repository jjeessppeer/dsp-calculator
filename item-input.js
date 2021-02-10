class InputItemElement extends HTMLLIElement {

  get rate(){
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
        </div>
        <img class="dropbtn" src="item_images/iron-plate.png">
      </div>
      <label>Items/s</label>
      <input type="text" size="3" placeholder="0" value="1">
    `.trim();
    
    let content = this.querySelector(".dropdown-content");
    for (const [key, element] of Object.entries(recepies)){
      if(element['not-item']) continue;
      let item = document.createElement('img');
      item.src = element.image;
      item.title = key;
      item.addEventListener('click', (event)=>this.selectItem(event.target.title));
      content.appendChild(item);
    }
    
    this.search = this.querySelector('input');
    this.img = this.querySelector('.dropbtn');
    this.querySelector(".dropbtn").addEventListener('click', (event)=>this.toggleDropdown(event));
    this.querySelector("button").addEventListener('click', (event)=>this.removeElement(event));

    this.item = "Iron ingot"
  }
  toggleDropdown(event) {
    // event.target.parentNode.classList.toggle('active');
    event.target.parentNode.classList.toggle('active');
    this.search.focus();
  }

  selectItem(itemName) {
    this.img.src = recepies[itemName].image;
    this.item = event.target.title;
    reloadResultsTable();
  }

  removeElement(event){
    this.remove();
    reloadResultsTable();
  }
}

class ResultRowElement extends HTMLTableSectionElement  {

  constructor(){
    super();
    this.classList.add('item-row')
    
    
  }

  updateItemRow(name, rate){
    // this.innerHTML = `
    //   <tr>
    //     <td><img></td>
    //     <td class="pad">1.5</td>
    //     <td><img src="`+active_belt.image+`"></td>
    //     <td class="pad">&times; 1.5</td>
    //     <td><img src="item_images/assembler-1.png"></td>
    //     <td class="pad">&times; 1.5</td>
    //     <td>100kW</td>
    //   </tr>
    // `.trim();

    let recepie = recepies[name];

    let length = Object.keys(recepie.creates).length;
    let i = 0;
    for (const item in recepie.creates){
      let items_per_s = recepie.creates[item]*rate;
      if (item in recepie.ingredients) items_per_s -= recepie.ingredients[item]*rate;
      if (items_per_s <= 0) continue;
      items_per_s = items_per_s
      let belts = items_per_s / active_belt.speed; 
      
      let machines = rate * recepie.time / active_machines[recepie.machine].speed;
      let power = active_machines[recepie.machine]["power-active"] * machines;

      if (i == 0){
        this.innerHTML += `
          <tr>
            <td><img src="`+recepies[item].image+`"></td>
            <td class="pad">`+formatNumber(items_per_s)+`</td>
            <td><img src="`+active_belt.image+`"></td>
            <td class="pad">&times; `+formatNumber(belts)+`</td>
            <td rowspan="`+length+`"><img src="`+active_machines[recepie.machine].image+`"></td>
            <td rowspan="`+length+`" class="pad">&times; `+formatNumber(machines)+`</td>
            <td rowspan="`+length+`">`+math.unit(power, 'W').toString()+`</td>
          </tr>`;
      }
      else {
        this.innerHTML += `
          <tr>
            <td><img src="`+recepies[item].image+`"></td>
            <td class="pad">`+formatNumber(items_per_s)+`</td>
            <td><img src="`+active_belt.image+`"></td>
            <td class="pad">&times; `+formatNumber(belts)+`</td>
          </tr>`;
      }
      i++;
    }

    // let imgs = this.querySelectorAll('img');
    // this.item_img = imgs[0];
    // this.belt_img = imgs[1];
    // this.machine_img = imgs[2];


    // let recepie = recepies[item];
    // if (Object.keys(recepies[item].creates).length != 1){

    // }

    

    // this.item_img.src = recepie.image;
    // this.belt_img.src = active_belt.image;
    // this.machine_img.src = active_machines[recepie.machine].image;

    // rate = rate;
    // let belts = rate / active_belt.speed;
    // let machines = rate * recepie.time / active_machines[recepie.machine].speed;
    // let power = active_machines[recepie.machine]["power-active"] * machines;
    // this.item_img.title = item;



    // this.querySelectorAll('img')[0].src = recepies[item].image;
    // this.querySelectorAll('td')[1].textContent = formatNumber(rate);
    // this.querySelectorAll('td')[3].innerHTML = '&times; ' + formatNumber(belts);
    // this.querySelectorAll('td')[5].innerHTML = '&times; ' + formatNumber(machines);
    // this.querySelectorAll('td')[6].innerHTML = math.unit(power, 'W').toString();

  }

  
}

function formatNumber(num){
    return num.toFixed(3).replace(/(\.0+|0+)$/, '');
}


customElements.define('input-item', InputItemElement, { extends: 'li' });
customElements.define('result-row', ResultRowElement, { extends: 'tbody' });


function addInputRow(){
  let listel = document.createElement('li', {is: 'input-item'});
  let btn = document.getElementById('addInputBtn');
  btn.parentNode.insertBefore(listel, btn);
  reloadResultsTable()
}

// function addResultRow(item, rate){
//   let elem = document.createElement('tr', {is: 'result-row'});
//   elem.updateItemRow(item, rate);
//   document.querySelector("#resultRows").appendChild(elem);
// }


var active_machines = {
  "Miner": machines["Miner"],
  "Smelter": machines["Smelter"],
  "Assembler": machines["Assembler"][0],
  "Matrix lab": machines["Matrix lab"],
  "Refinery": machines["Refinery"]
};
var active_belt = belts["Tier 1"];


function getRecepies(item){
  let result = {};
  for (const [name, recepie] of Object.entries(recepies)){
    if(item in recepie.creates) result[name] = recepie;
  }
  return result;
}

function recurseRecepies(item, used_items, used_recepies, order, previous){
  let recepies = getRecepies(item);
  for (const [name, recepie] of Object.entries(recepies)){
    order[previous].push(name);
  }
  if (used_items.includes(item)) return;
  used_items.push(item);
  
  for (const [name, recepie] of Object.entries(recepies)){
    if (recepie in used_recepies) continue;
    order[name] = [];
    used_recepies[name] = recepie;
    for (const [item, count] of Object.entries(recepie.ingredients)){
      recurseRecepies(item, used_items, used_recepies, order, name)
    }
  }
}

function createRows(name, order, result, parents){
  if (parents.includes(name)) return;
  if (result.includes(name)) result.splice(result.indexOf(name), 1);
  result.push(name);
  order[name].forEach(next_name => {
    let tmp = parents.slice();
    tmp.push(name)
    createRows(next_name, order, result, tmp)
  });
}

function reloadResultsTable(){
  console.log("__RELOADING RESULTS__")
  // Recalculate item requirements.
  let constraints = {};
  let used_recepies = {};
  let recepies_order = {'root': []};
  let used_items = [];
  let input_list = document.querySelectorAll('.outputItem');

  let input_items = [];
  input_list.forEach(element => {
    recurseRecepies(element.item, used_items, used_recepies, recepies_order, 'root');
    if (!(element.item in constraints)) constraints[element.item] = {'min': element.rate};
    else constraints[element.item]['min'] += element.rate;
  });

  console.log(used_items)
  console.log(used_recepies)
  console.log(recepies_order)

  // Build production matrix constraints.
  used_items.forEach(item => {
    if (!(item in constraints)) constraints[item] = {'min': 0};
  });


  let variables = {};
  for (const [recepie_name, recepie] of Object.entries(used_recepies)){
    let variable = {};
    for (const [item, count] of Object.entries(recepie.creates)){
      variable[item] = count;
    }
    for (const [item, count] of Object.entries(recepie.ingredients)){
      if (!(item in variable)) variable[item] = 0;
      variable[item] -= count;
    }
    if ('cost' in recepie) variable['cost'] = recepie['cost'];
    else recepie['cost'] = 1;
    variables[recepie_name] = variable;
  }
  console.log("MODEL")
  console.log(variables)
  console.log(constraints)

  let model={
    "optimize": "cost",
    "opType": "min",
    "constraints": constraints,
    "variables": variables
  };


  let lp_results = solver.Solve(model);
  console.log(lp_results);


  console.log("ORDER IN THE ROWS")
  let row_order = [];
  createRows('root', recepies_order, row_order, []);
  console.log(row_order);

  // document.getElementById('resultRows').innerHTML = '';
  document.querySelectorAll('.item-row').forEach(element => {element.remove()});
  row_order.forEach(name => {
    if (!(name in lp_results)) return;
    // let elem = document.createElement('tr', {is: 'result-row'});
    let elem = document.createElement('tbody',{is: 'result-row'});
    elem.updateItemRow(name, lp_results[name]);
    document.querySelector("#resultsTable").appendChild(elem);
  });

}

