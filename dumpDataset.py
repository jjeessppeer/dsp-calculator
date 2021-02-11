import re
import json
import os
import errno

stringProtoSet = open("dumps\datasets\StringProtoSet-resources.assets-20287-MonoBehaviour.txt", "r", encoding='utf-8')
itemProtoSet = open("dumps\datasets\ItemProtoSet-resources.assets-20282-MonoBehaviour.txt", "r", encoding='utf-8')
recepieProtoSet = open("dumps\datasets\RecipeProtoSet-resources.assets-20286-MonoBehaviour.txt", "r", encoding='utf-8')


translations = {}
items = {}
recepies = {}

MINE_TYPES = {
    'GATHER': [1030, 1031],
    'MINE': [
        1001, 1002, 1003, 1004, 1005, 1006, 
        1011, 1012, 1013, 1014, 1015, 1016],
    'PUMP': [1000, 1116],
    'ORBITAL_COLLECT': [1120, 1121, 1011],
    'OIL_EXTRACT': [1007]
}

RECEPIE_TYPES = {
    0: 'NONE',
    1: 'SMELT',
    2: 'CHEMICAL',
    3: 'REFINE',
    4: 'ASSEMBLE',
    5: 'PARTICLE',
    6: 'EXCHANGE',
    7: 'PHOTON_STORE',
    8: 'FRACTIONATE',
    15: 'RESEARCH'
}

ITEM_TYPES = {
    0: 'UNKNOWN',
    1: 'RESOURCE',
    2: 'MATERIAL',
    3: 'COMPONENT',
    4: 'PRODUCT',
    5: 'LOGISTICS',
    6: 'PRODUCTION',
    7: 'DECORATION',
    8: 'WEAPON',
    9: 'MATRIX',
    10: 'MONSTER'
}

DATA_CONV = {
    'int': int,
    'UInt8': int,
    'string': lambda v: str(v).replace('"', '')
}

# Read lines until a match is found. Return that line.
def skipToLine(expr, f):
    line = f.readline()
    while line:
        if re.search(expr, line): return line
        line = f.readline()
    raise Exception('Line not found: ' + expr)

# Return the next variable value with matching name.
def readValue(f, name):
    line = skipToLine(name, f)
    datatype = re.search(r'[a-zA-Z0-9]+(?= [a-zA-Z_-]+ = )', line)[0]
    value = re.search(r"(?<== ).+$", line)[0]
    return DATA_CONV[datatype](value)

# Return the values of the next array with matching name.
def readArray(f, name):
    out = []
    skipToLine(name, f)
    n = readValue(f, r'size')
    for _ in range(n):
        # line = skipToLine(r'data = ', f)
        v = readValue(f, 'data')
        # v = re.search(r'(?<=data = ).+$', line)[0]
        out.append(v)
    return out

def getMineType(item_id):
    types = []
    for key, items in MINE_TYPES.items():
        if item_id in items: types.append(key)
    return types
    
# PARSE TRANSLATION DATASET
print('Parsing translations...')
line = stringProtoSet.readline()
while line:
    match = re.search(r"\[[0-9]+\]", line)
    if match:
        name = readValue(stringProtoSet, 'Name')
        name_en = readValue(stringProtoSet, 'ENUS')
        translations[name] = name_en
    line = stringProtoSet.readline()

# PARSE ITEM DATASET
print('Parsing items...')
line = itemProtoSet.readline()
while line:
    match = re.search(r"^[ ]{3,3}\[[0-9]+\]", line)
    if match:
        # Find name
        # while not re.search(r'Name = ', line): line = itemProtoSet.readline()
        name = readValue(itemProtoSet, 'Name')
        name = translations[name]
        item_id = readValue(itemProtoSet, 'ID')
        item_type = readValue(itemProtoSet, 'Type')
        item_type = ITEM_TYPES[item_type]
        mined = getMineType(item_id)
        icon = readValue(itemProtoSet, 'IconPath')
        icon = os.path.basename(icon)
        items[item_id] = {'name': name, 'type': item_type, 'mined': mined, 'icon': icon}
    line = itemProtoSet.readline()

# PARSE RECEPIE DATASET
print('Parsing recepies...')
recepies = {}
line = recepieProtoSet.readline()
while line:
    match = re.search(r"^[ ]{3,3}\[[0-9]+\]", line)
    if match:
        recepie = {}
        name = readValue(recepieProtoSet, 'Name').replace('"', '')
        recepie['name'] = translations[name]
        recepie['id'] = readValue(recepieProtoSet, 'ID')
        recepie['type'] = RECEPIE_TYPES[readValue(recepieProtoSet, 'Type')]
        recepie['handcraft'] = readValue(recepieProtoSet, 'Handcraft')
        explicit = readValue(recepieProtoSet, 'Explicit')
        recepie['time'] = readValue(recepieProtoSet, 'TimeSpend')

        recepie['items_in'] = {}
        items_in = readArray(recepieProtoSet, 'Items')
        count_in = readArray(recepieProtoSet, 'ItemCounts')
        for i in range(len(items_in)):
            recepie['items_in'][items_in[i]] = count_in[i]

        recepie['items_out'] = {}
        items_out = readArray(recepieProtoSet, 'Results')
        count_out = readArray(recepieProtoSet, 'ResultCounts')
        for i in range(len(items_out)):
            recepie['items_out'][items_out[i]] = count_out[i]

        recepie['grid_index'] = readValue(recepieProtoSet, 'GridIndex')

        if explicit == 1:
            recepie['icon'] = os.path.basename(readValue(recepieProtoSet, 'IconPath'))
        else:
            recepie['icon'] = items[items_out[0]]['icon']
        recepies[recepie['id']] = recepie
    line = recepieProtoSet.readline()

# Insert pseudo recepies for mined resources
print("Inserting miner recepies...")
recepie_idx = max(recepies.keys()) + 1
for key, item in items.items():
    for mine_type in item['mined']:
        recepies[recepie_idx] = {
            'name': item['name']+' '+mine_type.lower().replace('_', ' '),
            'id': recepie_idx,
            'type': mine_type,
            'handcraft': 0,
            'time': 1,
            'items_in': {},
            'items_out': {key: 1},
            'grid_index': -1,
            'icon': item['icon']
        }
        recepie_idx += 1

# Write parsed dictionaries to json files
print('Dumping json...')

if os.path.exists("data/items.json"):
  os.remove("data/items.json")
items_out = open('data/items.json', 'a')
items_out.write(json.dumps(items, indent=2))

if os.path.exists("data/recepies.json"):
  os.remove("data/recepies.json")
recepies_out = open('data/recepies.json', 'a')
recepies_out.write(json.dumps(recepies, indent=2))


