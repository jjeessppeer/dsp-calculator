var ITEM_TYPES = {
    'MATRIX': 0,
    'PRODUCT': 1,
    'COMPONENT': 2,
    'MATERIAL': 3,
    'RESOURCE': 4,
    'PRODUCTION': 5,
    'LOGISTICS': 6,
    'UNKNOWN': -1,
    'DECORATION': -1,
    'WEAPON': -1,
    'MONSTER': -1
}


function formatNumber(num, decimals=3){
    return num.toFixed(decimals).replace(/(\.0+|0+)$/, '');
}