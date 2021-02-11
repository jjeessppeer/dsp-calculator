




import re
import json
import os
import errno

stringProtoSet = open("test/StringProtoSet-resources.assets-20186-MonoBehaviour.txt", "r", encoding='utf-8')
itemProtoSet = open("test/ItemProtoSet-resources.assets-20181-MonoBehaviour.txt", "r", encoding='utf-8')
recepieProtoSet = open("test/RecipeProtoSet-resources.assets-20185-MonoBehaviour.txt", "r", encoding='utf-8')


translations = {}
items = {}
recepies = {}

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
        mined = readValue(itemProtoSet, 'MiningFrom')
        if mined != '': mined = translations[mined]
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

print('Dumping json...')

if os.path.exists("data/items.json"):
  os.remove("data/items.json")
items_out = open('data/items.json', 'a')
items_out.write(json.dumps(items, indent=2))

if os.path.exists("data/recepies.json"):
  os.remove("data/recepies.json")
recepies_out = open('data/recepies.json', 'a')
recepies_out.write(json.dumps(recepies, indent=2))

print("Done. Files dum")
# jsonobj = json.dumps(items, indent=2)
# print(jsonobj)


