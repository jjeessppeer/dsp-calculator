function updateResults() {

}

// Solve a given factory given a set of output items, input items, and settings
// Returs a list of recepies and their rates.
function solveFactory(output_items, output_rates, input_items, enabled_recepies, proliferator_settings) {
  let constraints = {};
  let recepies_order = {'root': []};
  let used_recepies = {};
  let used_items = [];


  for (let i=0; i<output_items.length; i++) {
    recurseRecepies(output_items[i], used_items, used_recepies, recepies_order, 'root');
    if (!(output_items[i] in constraints)) constraints[element.item] = {'min': output_rates[i]};
    else constraints[element.item]['min'] += output_rates[i];
  }


}

function getRecepiesFromSettings() {
  let recepies = {};
  
  // Remove recepies based on settings.
  for (const recepie_id in recepies_full){
    recepies[recepie_id] = recepies_full[recepie_id];
  }
  
  document.querySelectorAll('#special-selection img').forEach(element => {
    if (element.classList.contains('active')) delete recepies[element.dataset.deactivates];
    else delete recepies[element.dataset.activates];
  });

  document.querySelectorAll('#settings-page .recepieSwitch img').forEach(
    element => {
    if (!element.classList.contains('active')) delete recepies[element.dataset.recepie];
  });

  // Add free recepies from input items.
  document.querySelectorAll('#inputItems li:not(:last-child)').forEach(element => {
    recepies[element.item + " imported"] = {
      "name": items[element.item].name + " imported",
      "type": "IMPORT",
      "handcraft": 0,
      "time": 0,
      "items_in": {},
      "items_out": {},
      "icon": "404.png",
      "cost": 0
    }
    recepies[element.item + " imported"]["items_out"][element.item] = 1;
  });

  SETTINGS.machines['ASSEMBLE'] = document.querySelector('#assembler-selection img.active').dataset.level;
  SETTINGS.belt = document.querySelector('#belt-selection img.active').dataset.level;

  SETTINGS.format = {};
  SETTINGS.format.precision = Number(document.querySelector('#numberPrecision').value);
  if (!SETTINGS.precision) SETTINGS.format.precision = 3;

  return recepies;
}

function getOutputItems() {

}

function getInputItems() {

}

function getProliferatorSettings() {

}

// Loads all recepies that are relevant to making one item
function recurseRecepies2(item_id, used_items, used_recepies, order, previous, recepie_book){

  // Get all recepies with output the desired item id.
  let recepies = {};
  for (const [recepie_id, recepie] of Object.entries(recepie_book)){
    if(item_id in recepie.items_out) recepies[recepie_id] = recepie;
  }

  for (const [recepie_id, recepie] of Object.entries(recepies)){
    order[previous].push(recepie_id);
  }
  if (used_items.includes(item_id)) return;
  used_items.push(item_id);
  
  for (const [recepie_id, recepie] of Object.entries(recepies)){
    if (recepie in used_recepies) continue;
    order[recepie_id] = [];
    used_recepies[recepie_id] = recepie;
    for (const [item_id, count] of Object.entries(recepie.items_in)){
      recurseRecepies2(item_id, used_items, used_recepies, order, recepie_id, recepie_book)
    }
  }
}




// Read and apply settings.
function pruneRecepies(){
  recepies = {};
  
  // Remove recepies based on settings.
  for (const recepie_id in recepies_full){
    recepies[recepie_id] = recepies_full[recepie_id];
  }
  
  document.querySelectorAll('#special-selection img').forEach(element => {
    if (element.classList.contains('active')) delete recepies[element.dataset.deactivates];
    else delete recepies[element.dataset.activates];
  });

  document.querySelectorAll('#settings-page .recepieSwitch img').forEach(
    element => {
    if (!element.classList.contains('active')) delete recepies[element.dataset.recepie];
  });

  // Add free recepies from input items.
  document.querySelectorAll('#inputItems li:not(:last-child)').forEach(element => {
    recepies[element.item + " imported"] = {
      "name": items[element.item].name + " imported",
      "type": "IMPORT",
      "handcraft": 0,
      "time": 0,
      "items_in": {},
      "items_out": {},
      "icon": "404.png",
      "cost": 0
    }
    recepies[element.item + " imported"]["items_out"][element.item] = 1;
  });

  SETTINGS.machines['ASSEMBLE'] = document.querySelector('#assembler-selection img.active').dataset.level;
  SETTINGS.belt = document.querySelector('#belt-selection img.active').dataset.level;

  SETTINGS.format = {};
  SETTINGS.format.precision = Number(document.querySelector('#numberPrecision').value);
  if (!SETTINGS.precision) SETTINGS.format.precision = 3;
}


// Return recepies that has selected item as output
function getRecepies(item_id){
  let result = {};
  for (const [recepie_id, recepie] of Object.entries(recepies)){
    if(item_id in recepie.items_out) result[recepie_id] = recepie;
  }
  return result;
}



// Loads all recepies that are relevant to making one item
function recurseRecepies(item_id, used_items, used_recepies, order, previous){
  let recepies = getRecepies(item_id);
  for (const [recepie_id, recepie] of Object.entries(recepies)){
    order[previous].push(recepie_id);
  }
  if (used_items.includes(item_id)) return;
  used_items.push(item_id);
  
  for (const [recepie_id, recepie] of Object.entries(recepies)){
    if (recepie in used_recepies) continue;
    order[recepie_id] = [];
    used_recepies[recepie_id] = recepie;
    for (const [item_id, count] of Object.entries(recepie.items_in)){
      recurseRecepies(item_id, used_items, used_recepies, order, recepie_id)
    }
  }
}

function createRows(recepie_id, order, result, parents){
  if (parents.includes(recepie_id)) return;
  if (result.includes(recepie_id)) result.splice(result.indexOf(recepie_id), 1);
  result.push(recepie_id);
  order[recepie_id].forEach(next_name => {
    let tmp = parents.slice();
    tmp.push(recepie_id)
    createRows(next_name, order, result, tmp)
  });
}

function reloadResultsTable(){
  pruneRecepies();
  console.log("UPDATING RESULTS");
  // Prepare items and recepies for linear program.

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

  // Build production matrix constraints.
  used_items.forEach(item => {
    if (!(item in constraints)) constraints[item] = {'min': 0};
  });

  let variables = {};
  for (const [recepie_id, recepie] of Object.entries(used_recepies)){
    let variable = {};
    for (const [item, count] of Object.entries(recepie.items_out)){
      variable[item] = count;
    }
    for (const [item, count] of Object.entries(recepie.items_in)){
      if (!(item in variable)) variable[item] = 0;
      variable[item] -= count;
    }
    // if ('cost' in recepie) variable['cost'] = recepie['cost'];
    // else variable['cost'] = 1;
    variable['cost'] = machines[recepie.type].cost;
    // variable['cost'] = 1;
    variables[recepie_id] = variable;
  }

  // Solve linear program to get recepie ratios

  let model={
    "optimize": "cost",
    "opType": "min",
    "constraints": constraints,
    "variables": variables
  };

  let lp_results = solver.Solve(model);

  // Setup the result rows

  let row_order = [];
  createRows('root', recepies_order, row_order, []);
  let power_total = 0;
  let results_table = document.querySelector("#resultsTable");
  document.querySelectorAll('#resultsTable > .item-row, #resultsTable > tr:last-child').forEach(element => {element.remove()});
  row_order.forEach(recepie_id => {
    if (!(recepie_id in lp_results)) return;
    let elem = document.createElement('tbody',{is: 'result-row'});
    elem.initializeItemRow(recepie_id, lp_results[recepie_id]);
    power_total += elem.power;
    results_table.appendChild(elem);
    
  });
  power_total = math.unit(power_total, 'kW').format(SETTINGS.format)
  let power_row = document.createElement('tr');
  power_row.innerHTML = `<td colspan="6"/><td>Total power:</td><td>`+power_total+`</td>`;
  results_table.appendChild(power_row);



  saveConfigToURL();
}
