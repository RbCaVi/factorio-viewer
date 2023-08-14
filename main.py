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
        info=towiki.towikiitem(item)
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
        info=towiki.towikifluid(fluid,group)
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

def uploadimage(data,uploadname,size=32):
    if force or forceimage or not wikiapi.pageexists('File:'+uploadname+'.png'):
        if not makeicon(data,size):
            return
        
        wikiapi.upload('temp.png',uploadname+'.png')

def fixcolor(col):
    if type(col)==list:
        if len(col)==3:
            col.append(1)
        col={'r':col[0],'g':col[1],'b':col[2],'a':col[3]}
    color={'r':0,'g':0,'b':0,'a':1}
    color.update(col)
    col=color
    if max(col.values())>1:
        col={c:v/255 for c,v in col.items()}
    a=col['a']
    col={c:v/a for c,v in col.items()}
    col['a']=a
    col={c:v*255 for c,v in col.items()}
    return [col[i] for i in ('b','g','r','a')]

def makeicon(data,size=32):
    if 'icons' in data:
        icons=data['icons']
        iconsize=data.get('icon_size')
        print(icons)
        canvas=np.zeros((size,size,4))
        canvas[:0:size]=(0,0,0,0)
        for icondata in icons:
            util.pj(icondata)
            iconname=icondata['icon']
            iconsize=icondata.get('icon_size',iconsize)
            icon=geticon(iconname,iconsize)
            if icon is None:
                return False
            if 'tint' in icondata:
                tint=np.zeros((iconsize,iconsize,4))
                tint[:0:size]=fixcolor(icondata['tint'])
                icon=icon*tint
            shift=(0,0)
            if 'shift' in icondata:
                shift=icondata['shift']
                shift[0]=int(shift[0])
                shift[1]=int(shift[1])
            isize=size
            if 'scale' in icondata:
                isize=iconsize*icondata['scale']
                isize=int(isize)
            blank=np.zeros_like(canvas)
            icon=skt.resize(icon,(isize,isize))
            top=((blank.shape[1]//2)-(isize//2)+shift[0])
            bottom=((blank.shape[1]//2)-(isize//2)+isize+shift[0])
            left=((blank.shape[0]//2)-(isize//2)+shift[1])
            right=((blank.shape[0]//2)-(isize//2)+isize+shift[1])
            itop=0
            ibottom=isize
            ileft=0
            iright=isize
            if top<0:
                itop=itop-top
                top=0
            if bottom>size:
                ibottom=ibottom+(size-bottom)
                bottom=size
            if left<0:
                ileft=ileft-left
                left=0
            if right>size:
                iright=iright+(size-right)
                right=size
            print(left,right,top,bottom)
            print(ileft,iright,itop,ibottom)
            blank[left:right,top:bottom,:]=icon[ileft:iright,itop:ibottom,:]
            icon=blank
            alpha=icon[:,:,3]
            calpha=canvas[:,:,3]
            alphaout=alpha+(calpha-(calpha*alpha))
            canvas[:,:,0]=((icon[:,:,0]*alpha)+(canvas[:,:,0]*(calpha-(calpha*alpha))))/alphaout
            canvas[:,:,1]=((icon[:,:,1]*alpha)+(canvas[:,:,1]*(calpha-(calpha*alpha))))/alphaout
            canvas[:,:,2]=((icon[:,:,2]*alpha)+(canvas[:,:,2]*(calpha-(calpha*alpha))))/alphaout
            canvas[:,:,3]=alphaout
            canvas[np.isnan(canvas)]=0
        canvas=skt.resize(canvas,(size,size))
        icon=canvas
    else:
        iconname=data['icon']
        iconsize=data['icon_size']
        icon=geticon(iconname,iconsize)
        if icon is None:
            return False
        icon=skt.resize(icon,(size,size))
    icon=(icon*255).astype('ubyte')
    sio.imshow(icon)
    sio.imsave('temp.png',icon,'pil')
    return True

def geticon(name,size):
   name=replaceroots(name,modroots)
   
   if '__' in name:
        print('icon not found: '+name)
        return None
   icon=sio.imread(name,plugin='pil',mode='RGBA',as_gray=False)[:size,:size]
   print(icon.shape)
   return icon
    
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
        
        
