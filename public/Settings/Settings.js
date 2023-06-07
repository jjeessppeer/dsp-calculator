var SETTINGS_DEFAULT = {
    'machines': {
        'IMPORT': 0,
        'SMELT': 0,
        'CHEMICAL': 0,
        'REFINE': 0,
        'ASSEMBLE': 0,
        'PARTICLE': 0,
        'EXCHANGE': 0,
        'PHOTON_CAPTURE': 0,
        'PHOTON_STORE': 0,
        'FRACTIONATE': 0,
        'RESEARCH': 0,
        'GATHER': 0,
        'MINE': 0,
        'PUMP': 0,
        'ORBITAL_COLLECT': 0,
        'OIL_EXTRACT': 0
    },
    belt: 0,
    format: { precision: 3 },
    decimals: 1
};

const DEFAULT_DISABLED_RECIPES = [
    "Silicon ore",
    "Fire Ice mine",
    "Reforming Refine",
    "Sulfuric Acid pump",
    "Organic Crystal mine",
    "Hydrogen orbital collect",
    "Space Warper",
    "Diamond (advanced)",
    "Organic Crystal (original)",
    "Crystal Silicon (advanced)",
    "Graphene (advanced)",
    "Carbon Nanotube (advanced)",
    "Casimir Crystal (advanced)",
    "Particle Container (advanced)",
    "Photon Combiner (advanced)"
]

var SETTINGS = JSON.parse(JSON.stringify(SETTINGS_DEFAULT));

function initializeSettings() {
    console.log('INITIALIZE SETTINGS');

    const table = document.querySelector('.settings-table');
    const assemberRow = document.createElement('tr', { is: 'item-selection-row' });
    // TODO: load from machine dataset.
    assemberRow.addItem('icons/assembler-1.png', '2303', 'Assembling Machine Mk.I');
    assemberRow.addItem('icons/assembler-2.png', '2304', 'Assembling Machine Mk.II');
    assemberRow.addItem('icons/assembler-3.png', '2305', 'Assembling Machine Mk.III');
    assemberRow.setTitle('Assember type:');
    table.append(assemberRow);

    const beltRow = document.createElement('tr', { is: 'item-selection-row' });
    // TODO: load from machine dataset.
    beltRow.addItem('icons/belt-1.png', '2001', 'Conveyor Belt MK.I');
    beltRow.addItem('icons/belt-2.png', '2002', 'Conveyor Belt MK.II');
    beltRow.addItem('icons/belt-3.png', '2003', 'Conveyor Belt MK.III');
    beltRow.setTitle('Belt type:');
    table.append(beltRow);

    
    console.log(getDuplicateRecipies());
    const recipeRow = document.createElement('tr', { is: 'recipe-selection-row' });
    recipeRow.setRecipes(getDuplicateRecipies());
    recipeRow.setTitle('Recipes:');
    recipeRow.toggleRecipe("32", true);
    // const r = getDuplicateRecipies();
    // for (const i in r) {
    //     console.log(items[i].name)
    //     for (const re of r[i]){
    //         console.log("\t", re, " ", recepies_full[re].name)
    //     }
    // }
    table.append(recipeRow);
    


}

function loadSettingsFromUrl() {

}

function saveSettingsToUI() {

}

function loadConfigFromURL() {
    document.querySelectorAll('.outputItem .inputItem').forEach(element => {
        element.remove()
    });
    let outputs = window.location.getHashParam("outputs");
    if (outputs) {
        outputs = outputs.split(',');
        for (let i = 0; i < outputs.length; i += 2) {
            addOutputRow(outputs[i], outputs[i + 1], false);
        }
    }
    else {
        addOutputRow(6001, 1, false);
    }
    let inputs = window.location.getHashParam("inputs");
    if (inputs) {
        inputs = inputs.split(',');
        for (let i = 0; i < inputs.length; i += 1) {
            addInputRow(inputs[i], false);
        }
    }
    let settings = window.location.getHashParam("settings");
    if (settings) {
        const elements = document.querySelectorAll('#settings-page img');
        settings = settings.split(",");
        if (settings.length != elements.length) throw 'Invalid settings data';
        for (let i = 0; i < elements.length; i += 1) {
            elements[i].classList.toggle('active', settings[i] == '1');
        }
    }
    // for (let i=0; i<elements.length; i++){
    //   settings.push(elements[i].classList.contains('active') ? 1 : 0);
    // }
}

function getDuplicateRecipies() {
    const recipe_item_map = {};
    for (const itemId in items) {
        recipe_item_map[itemId] = [];
    }
    for (const recipeId in recepies_full) {
        // if (recepies_full[key].type == 'MINE' || recepies_full[key].type == 'PUMP') continue;
        for (const itemId in recepies_full[recipeId].items_out) {
            recipe_item_map[itemId].push(recipeId);
            // console.log(outitem, ": ", recipe_item_map[outitem].length);
        }
    }

    // document.querySelectorAll(".settings-row").forEach(e => e.remove());
    const itemsWidthMultipleRecipes = {};
    for (const itemId in recipe_item_map) {
        if (recipe_item_map[itemId].length <= 1) continue;
        itemsWidthMultipleRecipes[itemId] = recipe_item_map[itemId];
        // console.log(items[key]);
        // console.log(key, ": ", recipe_item_map[key].length);

        // const table = document.querySelector('.settings-table');
        // const row = document.createElement('tr', { is: 'recipe-toggle' });
        // row.setRecipes(key, recipe_item_map[key]);
        // console.log(row);
        // table.append(row);
        // const e = `<tr>
        //     <td>test:</td>
        //     <td class="recipe-toggle">
        //       <img data-recepie="58" src="icons/X-ray.png">
        //       <img data-recepie="143" class="active" src="icons/orbital-collector.png">
        //     </td>
        // </tr>`
    }
    return itemsWidthMultipleRecipes;
}