


function createRows(recepie_id, order, result, parents) {
    if (parents.includes(recepie_id)) return;
    if (result.includes(recepie_id)) result.splice(result.indexOf(recepie_id), 1);
    result.push(recepie_id);
    order[recepie_id].forEach(next_name => {
        let tmp = parents.slice();
        tmp.push(recepie_id)
        createRows(next_name, order, result, tmp)
    });
}

function reloadResultsTable() {
    const [lp_results, recepies_order, recipes] = solveFactory();
    const proliferator_settings = getProliferatorSettings();

    // Setup the result rows

    let row_order = [];
    createRows('root', recepies_order, row_order, []);
    let power_total = 0;
    let results_table = document.querySelector("#resultsTable");
    document.querySelectorAll('#resultsTable > .item-row, #resultsTable > tr:last-child').forEach(element => { element.remove() });
    row_order.forEach(recepie_id => {
        if (!(recepie_id in lp_results)) return;
        let elem = document.createElement('tbody', { is: 'result-row' });
        elem.initializeItemRow(recepie_id, lp_results[recepie_id], recipes, proliferator_settings);
        power_total += elem.power;
        results_table.appendChild(elem);

    });
    power_total = math.unit(power_total, 'kW').format(SETTINGS.format)
    let power_row = document.createElement('tr');
    power_row.innerHTML = `<td colspan="6"/><td>Total power:</td><td>` + power_total + `</td>`;
    results_table.appendChild(power_row);



    saveConfigToURL();
}


function saveConfigToURL() {
    let outputs = [];
    document.querySelectorAll('.outputItem').forEach(element => {
        outputs.push(element.item);
        outputs.push(element.rate);
    });
    if (outputs.length > 0)
        window.location.setHashParam("outputs", outputs.toString());
    else
        window.location.removeHashParam("outputs");
    let inputs = [];
    document.querySelectorAll('.inputItem').forEach(element => {
        inputs.push(element.item);
    });
    if (inputs.length > 0)
        window.location.setHashParam("inputs", inputs.toString());
    else
        window.location.removeHashParam("inputs");

    let settings = [];
    const elements = document.querySelectorAll('#settings-page img');
    for (let i = 0; i < elements.length; i++) {
        settings.push(elements[i].classList.contains('active') ? 1 : 0);
    }
    window.location.setHashParam("settings", settings.join(","));
}