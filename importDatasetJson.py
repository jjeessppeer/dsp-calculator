import re
import json
import os
import errno

# Dumping datasets from game files before importing:
# * Open "Dyson Sphere Program/DSPGAME_Data/resources.assets" with UABE (Unity Asset Bundle Extractor)
# * Locate and dump the assets "StringProtoSet", "ItemProtoset", "RecipieProtoSet"
# * Make sure that you dump the MonoBehavior assets and not the MonoScript which are named the same. File ID should be 0, not 1.
# * The asset names may have "MonoBehaviour" appended before them like "MonoBehaviour StringProtoSet" etc.


stringProtoSet = open("dumps\datasets\StringProtoSet-resources.assets-MonoBehaviour.json", "r", encoding='utf-8')
itemProtoSet = open("dumps\datasets\ItemProtoSet-resources.assets-MonoBehaviour.json", "r", encoding='utf-8')
recepieProtoSet = open("dumps\datasets\RecipeProtoSet-resources.assets-MonoBehaviour.json", "r", encoding='utf-8')

stringProtoSet = json.load(stringProtoSet)
itemProtoSet = json.load(itemProtoSet)
recepieProtoSet = json.load(recepieProtoSet)


translations_default = {}
items = {}
recepies = {}

MINE_TYPES = {
    'GATHER': [1030, 1031],
    'MINE': [
        1001, 1002, 1003, 1004, 1005, 1006, 
        1011, 1012, 1013, 1014, 1015, 1016, 1117],
    'PUMP': [1000, 1116],
    'ORBITAL_COLLECT': [1120, 1121, 1011],
    'OIL_EXTRACT': [1007],
    'PHOTON_STORE': [1208]
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

def getMineType(item_id):
    types = []
    for key, items in MINE_TYPES.items():
        if item_id in items: types.append(key)
    return types

def translateString(s, targetLanguage="ENUS"):
    # if s in translations_default: 
    #     return translations_default[s]
    # Default item names are sometimes in different languages, idk
    for translation in stringProtoSet["dataArray"]["Array"]:
        name = translation["Name"]
        name_ZHCN = translation["ZHCN"]
        name_ENUS = translation["ENUS"]
        tr_id = translation["ID"]
        # print("Weird translation at ", tr_id )
        if name == s or name_ZHCN == s: return translation[targetLanguage]
        # if name_ZHCN == s: return name_ENUS

    # return translations_ZHCN[s]
    raise Exception("No translation found for string")
    
# # PARSE TRANSLATION DATASET
# print('Importing translations...')
# for translation in stringProtoSet["dataArray"]["Array"]:
#     name = translation["Name"]
#     name_ENUS = translation["ENUS"]
#     translations_default[name] = name_ENUS

# PARSE ITEM DATASET
print('Importing items...')
for item in itemProtoSet["dataArray"]["Array"]:
    item_id = item["ID"]
    # print(item_id)
    name = item["Name"]
    name = translateString(name) # Default is cn, translate to en
    item_type = item["Type"]
    item_type = ITEM_TYPES[item_type] # Convert from int to represenative string
    mined = getMineType(item_id)
    icon = 'icons/'+os.path.basename(item["IconPath"])+'.png'
    items[item_id] = {'name': name, 'type': item_type, 'mined': mined, 'icon': icon}
# print(items)

# PARSE RECEPIE DATASET
print('Importing recepies...')

for dumpRecepie in recepieProtoSet["dataArray"]["Array"]:
    recepie_id = dumpRecepie["ID"]

    itemids_in = dumpRecepie["Items"]["Array"]
    count_in = dumpRecepie["ItemCounts"]["Array"]
    itemids_out = dumpRecepie["Results"]["Array"]
    count_out = dumpRecepie["ResultCounts"]["Array"]

    items_in = {}
    items_out = {}
    for i in range(len(itemids_in)):
        items_in[itemids_in[i]] = count_in[i]
    for i in range(len(itemids_out)):
        items_out[itemids_out[i]] = count_out[i]

    recepies[recepie_id] = {
        'name': translateString(dumpRecepie["Name"]),
        'type': RECEPIE_TYPES[dumpRecepie["Type"]],
        'handcraft': dumpRecepie["Handcraft"],
        'time': dumpRecepie["TimeSpend"],
        'items_in': items_in,
        'items_out': items_out,
        'icon': 
            "icons/{}.png".format(os.path.basename(dumpRecepie["IconPath"])) if dumpRecepie["Explicit"] == 1 
            else items[dumpRecepie["Results"]["Array"][0]]['icon']
    }

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
            'time': 60,
            'items_in': {},
            'items_out': {key: 1},
            # 'grid_index': -1,
            'icon': item['icon']
        }
        recepie_idx += 1

# Modify special recepies
print('Fixing special recepies...')
# Deuterium fractionation
recepies[115]['items_in'][1120] = 1 
recepies[115]['time'] = int(60/(30*0.01))

# Write imported datasets to json files
print('Saving datasets...')

if os.path.exists("public/data/items.json"):
  os.remove("public/data/items.json")
items_out = open('public/data/items.json', 'a')
items_out.write(json.dumps(items, indent=2))

if os.path.exists("public/data/recepies.json"):
  os.remove("public/data/recepies.json")
recepies_out = open('public/data/recepies.json', 'a')
recepies_out.write(json.dumps(recepies, indent=2))


