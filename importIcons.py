import json
import shutil
import os
from PIL import Image
import math

# Dumping textures from game before imprting:
# * Load main "Dyson Sphere Program" folder in Unity Asset Studio gui
# * Go to assets tab, filter by Texture2D. Select all assets and extract them.

with open('public/data/items.json', 'r') as items_file:
    items = json.load(items_file)
with open('public/data/recepies.json', 'r') as recepies_file:
    recepies = json.load(recepies_file)





def importIcon(item):
    icon_file = os.path.basename(item['icon'])
    source = 'dumps/textures/Texture2D/'+icon_file
    dest = "public/{}".format(item['icon'])

    if os.path.exists(dest): return
    print(dest)

    im = Image.open(source)
    # im.thumbnail((40, 40), Image.ANTIALIAS)
    im.save(dest, 'PNG')   

print('Importing item icons...')
for item_id, item in items.items():
    importIcon(item)

print('Importing recepie icons...')
for recepie_id, recepie in recepies.items():
    importIcon(recepie)

def getIcon(item):
    icon_file = os.path.basename(item['icon'])
    return Image.open('dumps/textures/Texture2D/'+icon_file)

# print("Building spritesheet...")
# tile_width = 80
# tile_height = 80
# tile_n = 134
# sheet_size = 960, 960
# spritesheet = Image.new("RGBA", sheet_size)
# i = 0
# added = []
# for item_id, item in items.items():
#     if (item['icon'] in added): continue
#     added.append(item['icon'])
#     x = (i*tile_width)%sheet_size[0]
#     y = math.floor(i*tile_height/sheet_size[1])*tile_height
#     source_image = getIcon(item)
#     spritesheet.paste(source_image, (x, y))
#     i += 1

# for item_id, item in recepies.items():
#     if (item['icon'] in added): continue
#     added.append(item['icon'])

#     x = (i*tile_width)%sheet_size[0]
#     y = math.floor(i*tile_height/sheet_size[1])*tile_height
#     source_image = getIcon(item)
#     spritesheet.paste(source_image, (x, y))
#     i += 1
# spritesheet.save('out.png') 

print("Done.")
    