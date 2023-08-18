import data
import fix
import locales as locale
import util
import wikiapi
import process
import towiki
import skimage.io as sio
import skimage.transform as skt
import numpy as np
import time
import traceback
import json

sio.use_plugin('pil')

force=False
forcepage=False
forceimage=False

def replaceroots(path,roots):
    for root in roots:
        print(path,root,roots[root])
        path=path.replace(root,roots[root])
        print(path)
    return path

data.init()
process.init()

import sys
import os

silos=['rocket-silo','se-space-probe-rocket-silo']

graphicsroots={
    '__space-exploration-graphics__':'/storage/emulated/0/Documents/SE/space-exploration-graphics_0.6.13/space-exploration-graphics',
    '__base__':'/storage/emulated/0/Documents/Factorio_1.1.69/data/base'}
#print(spacks)
#for item in cards+spacks:
    
def putitemonwiki(item,recipenames,consumers):
    idata=process.getitem(item)
    print(item,recipenames)
    
    realname=locale.itemlocale(item,data.data)[0]
        
    print(realname)
    
    uploadimage(idata,realname)
    
    if force or forcepage or not wikiapi.pageexists(realname):
        info=towiki.towikiitem(idata)
        info=towiki.towikirecipe(recipenames,info)
        info=towiki.addconsumers(consumers,info)
        if len(recipenames)==0:
            info['producers']=silos # the only items without a recipe producing them are rocket launch products
        infobox=towiki.toinfobox(info)
        
        category='\n<noinclude>[[Category:'+info['category']+']]</noinclude>'
        
        contents=infobox+category
        
        print(contents)
        
        time=wikiapi.gettimestamp()
        
        util.pj(wikiapi.edit(realname,contents,time,createonly=False))

def putfluidonwiki(fluid,group,recipenames,consumers):
    idata=process.getitem(fluid)
    print(fluid,recipenames)
    
    realname=locale.fluidlocale(fluid,data.data)[0]
        
    print(realname)
    
    uploadimage(idata,realname)
    
    if force or forcepage or not wikiapi.pageexists(realname):
        info=towiki.towikifluid(idata,group)
        info=towiki.towikirecipe(recipenames,info)
        info=towiki.addconsumers(consumers,info)
        infobox=towiki.toinfobox(info)
        
        category='\n<noinclude>[[Category:'+info['category']+']]</noinclude>'
        
        contents=infobox+category
        
        print(contents)
        
        time=wikiapi.gettimestamp()
        
        util.pj(wikiapi.edit(realname,contents,time,createonly=False))

def puttechonwiki(tech):
    tdata=data.data['technology'][tech]
    
    realname=locale.techlocale(tech,data.data)[0]+' (technology)'
    
    print(realname)
    
    uploadimage(tdata,realname,size=256)
    
    if force or forcepage or not wikiapi.pageexists(realname):
        info=towiki.towikitech(tech)
        infobox=towiki.toinfobox(info)
        
        contents=infobox
        
        print(contents)
        
        time=wikiapi.gettimestamp()
        
        util.pj(wikiapi.edit(realname,contents,time,createonly=False))
    
def read():
    entries=[]
    with open(os.path.join(util.root,util.todofile),'r') as f:
        data=f.read()
    entries=[]
    for line in data.split('\n'):
        if len(line)==0:
            continue
        data=json.loads(line)
        if data not in entries:
            entries.append(data)
    return entries

def write():
    with open(os.path.join(util.root,util.todofile),'w') as f:
        for data in entries:
            f.write(json.dumps(data))
            f.write('\n')

def processentry(entry):
    print(entry)
    t=entry['type']
    if t=='tech':
        puttechonwiki(entry['name'])
    elif t=='recipes':
        putrecipesonwiki(entry['recipes'])
    elif t=='item':
        putitemonwiki(entry['name'],entry['recipes'],entry['consumers'])
    elif t=='fluid':
        putfluidonwiki(entry['name'],entry['group'],entry['recipes'],entry['consumers'])

entries=read()

for entry in list(entries):
    try:
        processentry(entry)
        entries.remove(entry)
        write()
    except Exception as e:
        traceback.print_exc()
        input()
        with open(os.path.join(util.root,'failed.txt'),'a') as f:
            f.write(json.dumps(data))
            f.write('\n')
    finally:
        pass
        
        
