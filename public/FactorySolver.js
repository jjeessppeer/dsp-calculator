
function loadSettings() {
    SETTINGS.machines['ASSEMBLE'] = document.querySelector('#assembler-selection img.active').dataset.level;
    SETTINGS.belt = document.querySelector('#belt-selection img.active').dataset.level;

    SETTINGS.format = {};
    SETTINGS.format.precision = Number(document.querySelector('#numberPrecision').value);
    if (!SETTINGS.precision) SETTINGS.format.precision = 3;
}

function getOutputItems() {
    const outputItems = [];
    const outputRates = [];
    document.querySelectorAll('.outputItem').forEach(el => {
        outputItems.push(el.item);
        outputRates.push(el.rate);
    });
    return [outputItems, outputRates];
}

function getEnabledRecipes() {
    const recipes = {};
    // Remove recepies based on settings.
    for (const recepie_id in recepies_full) {
        recipes[recepie_id] = recepies_full[recepie_id];
    }
    document.querySelectorAll('#special-selection img').forEach(element => {
        if (element.classList.contains('active')) delete recipes[element.dataset.deactivates];
        else delete recipes[element.dataset.activates];
    });
    document.querySelectorAll('#settings-page .recepieSwitch img').forEach(element => {
        if (!element.classList.contains('active')) delete recipes[element.dataset.recepie];
    });
    return recipes;
}

function getProliferatorSettings() {
    
}

function applyProliferator(recipes, proliferatorSettings) {

}

function addInputRecipes(recipes) {
    // Add free recepies from input items.
    document.querySelectorAll('#inputItems li:not(:last-child)').forEach(element => {
        recipes[element.item + " imported"] = {
            "name": items[element.item].name + " imported",
            "type": "IMPORT",
            "handcraft": 0,
            "time": 0,
            "items_in": {},
            "items_out": {},
            "icon": "404.png",
            "cost": 0
        }
        recipes[element.item + " imported"]["items_out"][element.item] = 1;
    });
}

// output_items, output_rates, input_items, enabled_recepies, proliferator_settings
function solveFactory() {
    const recipes = getEnabledRecipes();
    addInputRecipes(recipes);

    console.log("UPDATING RESULTS");
    // Prepare items and recepies for linear program.

    // Recalculate item requirements.
    const constraints = {};
    const used_recepies = {};
    const recepies_order = { 'root': [] };
    const used_items = [];

    const [output_items, output_rates] = getOutputItems();
    for (let i = 0; i < output_items.length; i++) {
        const item = output_items[i];
        const rate = output_rates[i];
        recurseRecepies(item, used_items, used_recepies, recepies_order, 'root', recipes);
        if (!(item in constraints)) constraints[item] = { 'min': rate };
        else constraints[item]['min'] += rate;

    }

    // Build production matrix constraints.
    used_items.forEach(item => {
        if (!(item in constraints)) constraints[item] = { 'min': 0 };
    });

    let variables = {};
    for (const [recepie_id, recepie] of Object.entries(used_recepies)) {
        let variable = {};
        for (const [item, count] of Object.entries(recepie.items_out)) {
            variable[item] = count;
        }
        for (const [item, count] of Object.entries(recepie.items_in)) {
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

    let model = {
        "optimize": "cost",
        "opType": "min",
        "constraints": constraints,
        "variables": variables
    };

    const lp_results = solver.Solve(model);

    return [lp_results, recepies_order, recipes];
}




// Loads all recepies that are relevant to making one item
function recurseRecepies(item_id, used_items, used_recepies, order, previous, recipe_set) {
    const recepies = getItemRecepies(item_id, recipe_set);
    for (const [recepie_id, recepie] of Object.entries(recepies)) {
        order[previous].push(recepie_id);
    }
    if (used_items.includes(item_id)) return;
    used_items.push(item_id);

    for (const [recepie_id, recepie] of Object.entries(recepies)) {
        if (recepie in used_recepies) continue;
        order[recepie_id] = [];
        used_recepies[recepie_id] = recepie;
        for (const [item_id, count] of Object.entries(recepie.items_in)) {
            recurseRecepies(item_id, used_items, used_recepies, order, recepie_id, recipe_set)
        }
    }
}

// Return recepies that has selected item as output
function getItemRecepies(item_id, recipes){
    let result = {};
    for (const [recepie_id, recepie] of Object.entries(recipes)){
      if(item_id in recepie.items_out) result[recepie_id] = recepie;
    }
    return result;
}