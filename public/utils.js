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
    // let v = str.toString().split(""); 
    // return v
    // return
    return (Math.ceil(num*Math.pow(10, decimals))/Math.pow(10, decimals));
    // return num
    // let revS = str.toFixed(decimals).split('').reverse().join('')
    // let revN = revS.replace(/^0+(?=[1-9]*\.)/, '')
    // let s = revN.split('').reverse().join('');
    // console.log(str, revS, revN, s)
    // return s
    // return str.toFixed(decimals).replace(/\.0+$/, '');
}

// Convert a string to a number
function toNumber(str){
    let num = Number(str);
    if (num) return num;

    if (str.match(/[0-9]+\/[1-9]+/)){
        let index = str.indexOf('/');
        let n1 = Number(str.substring(0, index));
        let n2 = Number(str.substring(index+1));
        return n1/n2;
    }
    return 0;
}