import json
import shutil
import os
with open('data/items.json', 'r') as items_file:
    items = json.load(items_file)
with open('data/recepies.json', 'r') as recepies_file:
    recepies = json.load(recepies_file)

print('Importing item icons...')
for item_id, item in items.items():
    if not os.path.exists('icons/'+item['icon']+'.png'):
        shutil.copyfile('dumps/textures/Texture2D/'+item['icon']+'.png', 'icons/'+item['icon']+'.png')
        print(item['icon'])

print('Importing item icons...')
for recepie_id, recepie in recepies.items():
    if not os.path.exists('icons/'+recepie['icon']+'.png'):
        shutil.copyfile('dumps/textures/Texture2D/'+recepie['icon']+'.png', 'icons/'+recepie['icon']+'.png')
        print(recepie['icon'])

print("Done.")
    