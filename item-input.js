class InputItemElement extends HTMLLIElement {

  get rate(){
    let val = this.querySelectorAll("input")[1].value;
    if (val) return val;
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
        <img class="dropbtn" src="item_images/copper-ore.png">
      </div>
      <label>Items/s</label>
      <input type="text" size="3" placeholder="0" value="1">
    `.trim();
    
    let content = this.querySelector(".dropdown-content");
    for (const [key, element] of Object.entries(recepies)){
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


    this.item = "Copper ore"
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

class ResultRowElement extends HTMLTableRowElement {

  constructor(){
    super();
    this.classList.add('item-row')
    this.innerHTML = `
      <td><img src="item_images/copper-ore.png"></td>
      <td class="pad">1.5</td>
      <td><img src="`+active_belt.image+`"></td>
      <td class="pad">&times; 1.5</td>
      <td><img src="item_images/assembler-1.png"></td>
      <td class="pad">&times; 1.5</td>
      <td>100kW</td>
    `.trim();
    let imgs = this.querySelectorAll('img');
    this.item_img = imgs[0];
    this.belt_img = imgs[1];
    this.machine_img = imgs[2];
  }

  updateItemRow(item, rate){
    let recepie = recepies[item];

    this.item_img.src = recepie.image;
    this.belt_img.src = active_belt.image;
    this.machine_img.src = active_machines[recepie.machine].image;

    rate = rate;
    let belts = rate / active_belt.speed;
    let machines = rate * recepie.time / active_machines[recepie.machine].speed;
    let power = active_machines[recepie.machine]["power-active"] * machines;

    this.querySelectorAll('img')[0].src = recepies[item].image;
    this.querySelectorAll('td')[1].textContent = formatNumber(rate);
    this.querySelectorAll('td')[3].innerHTML = '&times; ' + formatNumber(belts);
    this.querySelectorAll('td')[5].innerHTML = '&times; ' + formatNumber(machines);
    this.querySelectorAll('td')[6].innerHTML = math.unit(power, 'W').toString();

  }

  
}

function formatNumber(num){
    return num.toFixed(3).replace(/(\.0+|0+)$/, '');
}


customElements.define('input-item', InputItemElement, { extends: 'li' });
customElements.define('result-row', ResultRowElement, { extends: 'tr' });


function addInputRow(){
  let listel = document.createElement('li', {is: 'input-item'});
  let btn = document.getElementById('addInputBtn');
  btn.parentNode.insertBefore(listel, btn);
  reloadResultsTable()
}

function addResultRow(){
  let elem = document.createElement('tr', {is: 'result-row'});
  document.querySelector("#resultRows").appendChild(elem);
}


var active_machines = {
  "Miner": machines["Miner"],
  "Smelter": machines["Smelter"],
  "Assembler": machines["Assembler"][0],
  "Matrix lab": machines["Matrix lab"],
  "Refinery": machines["Refinery"]
};
var active_belt = belts["Tier 1"];
var h_overflow = 0;


function recurseRequirements(requirements, order, item, rate) {
  if (!requirements[item]) requirements[item] = 0;
  for (const [key, element] of Object.entries(recepies[item].creates)){
    if (!requirements[key]) requirements[key] = 0;
    requirements[key] += Number(rate)*element;
  }
    // requirements[item] += Number(rate);


  const index = order.indexOf(item);
  if (index > -1) order.splice(index, 1);
  order.push(item);
  
  
  console.log(item)
  if (recepies[item].multi) {
    console.log(item)
    return;
  }
  for (const [item_in, count_in] of Object.entries(recepies[item]["ingredients"])){
    let count_out = recepies[item].creates[item];
    recurseRequirements(requirements, order, item_in, rate*count_in/count_out);
  }

}

function reloadResultsTable(){

  // Recalculate item requirements.

  let requirements = {};
  let order = [];

  let input_list = document.querySelectorAll('.outputItem');
  input_list.forEach(element => {
    recurseRequirements(requirements, order, element.item, element.rate);
  });

  // Resolve hydrogen
  // Resolve graphite


  document.getElementById('resultRows').innerHTML = '';




  console.log(requirements);

  order.forEach(item => {
    let rowElem = document.createElement('tr', {is: 'result-row'});
    rowElem.updateItemRow(item, requirements[item]);
    document.querySelector("#resultRows").appendChild(rowElem);
  });
  
  //Clear table
  //Update table
}