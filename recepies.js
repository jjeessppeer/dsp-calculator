// "TEMPLATE": {
//     "machines": ["Replicator", "Assembler"],
//     time: 1,
//     creates: 1,
//     ingredients: {},
//     image: "/item_images/.png"},



belts = {
    "Tier 1": {
        speed: 6,
        image: "/item_images/belt-1.png"
    },
    "Tier 2": {
        speed: 12,
        image: "/item_images/belt-2.png"
    },
    "Tier 3": {
        speed: 30,
        image: "/item_images/belt-3.png"
    }
}

machines = {
    "Replicator": {
        speed: 2,
        image: ""
    },
    "Miner": {
        speed: 1,
        "power-idle": 0,
        "power-active": 0,
        image: "/item_images/mining-drill.png"
    },
    "Smelter": {
        speed: 1,
        "power-idle": 12000,
        "power-active": 360000,
        image: "/item_images/smelter.png"
    },
    "Refinery": {
        speed: 1,
        "power-idle": 24000,
        "power-active": 960000,
        image: "/item_images/oil-refinery.png"
    },
    "Assembler": [
        {
            speed: 0.75, 
            "power-idle": 12000,
            "power-active":  270000,
            image: "/item_images/assembler-1.png"},
        {
            speed: 1,
            "power-idle": 15000,
            "power-active":  480000, 
            image: "/item_images/assembler-2.png"},
        {
            speed: 1.5,
            "power-idle": 18000,
            "power-active":  780000, 
             image: "/item_images/assembler-3.png"}
    ],
    "Matrix lab": {
        speed: 1,
        "power-idle": 12000,
        "power-active": 480000,
        image: "/item_images/lab.png"
    }

}


recepies = {
    "Iron ore": {
        'not-item': true,
        machine: "Miner",
        time: 1,
        creates: {"Iron ore": 1},
        ingredients: {},
        cost: 10,
        image: "/item_images/iron-ore.png"},
    "Copper ore": {
        'not-item': true,
        machine: "Miner",
        time: 1,
        creates: {"Copper ore": 1},
        ingredients: {},
        cost: 10,
        image: "/item_images/copper-ore.png"
    },
    "Iron ingot": {
        machine: "Smelter",
        time: 1,
        creates: {"Iron ingot": 1},
        ingredients: {"Iron ore": 1},
        image: "/item_images/iron-plate.png"
    },
    "Copper ingot": {
        machine: "Smelter",
        time: 1,
        creates: {"Copper ingot": 1},
        ingredients: {"Copper ore": 1},
        image: "/item_images/copper-plate.png"
    },
    "Magnet": {
        machine: "Smelter",
        time: 1.5,
        creates: {"Magnet": 1},
        ingredients: {"Iron ore": 1},
        image: "/item_images/magnet.png"
    },
    "Magnetic coil": {
        machine: "Assembler",
        time: 1,
        creates: {"Magnetic coil": 2},
        ingredients: {"Magnet": 2, "Copper ingot": 1},
        image: "/item_images/magnetism-wire.png"
    },
    "Circuit board": {
        machine: "Assembler",
        time: 1,
        creates: {"Circuit board": 2},
        ingredients: {"Iron ingot": 2, "Copper ingot": 1},
        image: "/item_images/circuit-board.png"
    },
    "Electromagnetic matrix": {
        machine: "Matrix lab",
        time: 3,
        creates: {"Electromagnetic matrix": 1},
        ingredients: {"Magnetic coil": 1, "Circuit board": 1},
        image: "/item_images/t-matrix.png"
    },
    
    "Energy matrix": {
        machine: "Matrix lab",
        time: 6,
        creates: {"Energy matrix": 1},
        ingredients: {"Energetic graphite": 1, "Hydrogen": 1},
        image: "/item_images/e-matrix.png"
    },

    "Energetic graphite": {
        machine: "Smelter",
        time: 2,
        creates: {"Energetic graphite": 1},
        ingredients: {"Coal": 2},
        image: "/item_images/graphite.png"
    },

    "Coal":{
        'not-item': true,
        machine: "Miner",
        time: 1,
        creates: {"Coal": 1},
        ingredients: {},
        image: "/item_images/coal-ore.png",
        cost: 10
    },

    "Hydrogen": {
        // 'not-item': true,
        machine: "Miner",
        time: 1,
        creates: {"Hydrogen": 1},
        ingredients: {},
        image: "/item_images/hydrogen.png",
        cost: 9999
    },

    "X-ray": {
        'not-item': true,
        machine: "Refinery",
        time: 1,
        creates: {"Hydrogen": 3, "Energetic graphite": 1},
        ingredients: {"Refined oil": 2, "Hydrogen": 2},
        image: "/item_images/X-ray.png"
    },

    "Refined oil":{
        'not-item': true,
        machine: "Refinery",
        time: 4,
        creates: {"Refined oil": 2, "Hydrogen": 1},
        ingredients: {"Crude oil": 1},
        image: "/item_images/refined-oil.png"
    },

    "Crude oil":{
        'not-item': true,
        machine: "Miner",
        time: 1,
        creates: {"Crude oil": 1},
        ingredients: {},
        image: "/item_images/oil.png",
        cost: 100
    }
  
    
}


// hydrogen_recepies = [
//     {
//         machine: "Miner",
//         time: 1,
//         creates: 1,
//         ingredients: {},
//         image: ""
//     },
//     {
//         machine: "Refinery",
//         time: 4,
//         creates: {"Energetic graphite": 1, "Hydrogen": 3},
//         ingredients: {"Refined oil": 1, "Hydrogen": 2},
//         image: ""
//     }
//     ]


// graphite_recepies = [
//     {
//         machine: "Smelter",
//         time: 2,
//         creates: 1,
//         ingredients: {"Coal": 2},
//         image: "/item_images/t-matrix.png"
//     },
//     {
//         machine: "Refinery",
//         time: 4,
//         creates: {"Energetic graphite": 1, "Hydrogen": 3},
//         ingredients: {"Refined oil": 1, "Hydrogen": 2},
//         image: ""
//     }]


