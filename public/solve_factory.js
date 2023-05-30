function getDuplicateRecipies() {
  const recipe_item_map = {};
  for (const key in items) {
    recipe_item_map[key] = [];
  }
  for (const key in recepies_full) {
    // if (recepies_full[key].type == 'MINE' || recepies_full[key].type == 'PUMP') continue;
    for (const outitem in recepies_full[key].items_out) {
      recipe_item_map[outitem].push(key);
      // console.log(outitem, ": ", recipe_item_map[outitem].length);
    }
  }
  
  document.querySelectorAll(".settings-row").forEach(e => e.remove());
  for (const key in recipe_item_map) {
    if (recipe_item_map[key].length <= 1) continue;
    // console.log(items[key]);
    // console.log(key, ": ", recipe_item_map[key].length);

    const table = document.querySelector('.settings-table');
    const row = document.createElement('tr', {is: 'recipe-toggle'});
    row.setRecipes(key, recipe_item_map[key]);
    console.log(row);
    table.append(row);
    // const e = `<tr>
    //     <td>test:</td>
    //     <td class="recipe-toggle">
    //       <img data-recepie="58" src="icons/X-ray.png">
    //       <img data-recepie="143" class="active" src="icons/orbital-collector.png">
    //     </td>
    // </tr>`
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
  const [lp_results, recepies_order, recipes] = solveFactory();

  // Setup the result rows

  let row_order = [];
  createRows('root', recepies_order, row_order, []);
  let power_total = 0;
  let results_table = document.querySelector("#resultsTable");
  document.querySelectorAll('#resultsTable > .item-row, #resultsTable > tr:last-child').forEach(element => {element.remove()});
  row_order.forEach(recepie_id => {
    if (!(recepie_id in lp_results)) return;
    let elem = document.createElement('tbody',{is: 'result-row'});
    elem.initializeItemRow(recepie_id, lp_results[recepie_id], recipes);
    power_total += elem.power;
    results_table.appendChild(elem);
    
  });
  power_total = math.unit(power_total, 'kW').format(SETTINGS.format)
  let power_row = document.createElement('tr');
  power_row.innerHTML = `<td colspan="6"/><td>Total power:</td><td>`+power_total+`</td>`;
  results_table.appendChild(power_row);



  saveConfigToURL();
}
