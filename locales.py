import os
import util
import copy
import data

mods=filter(lambda x:x.is_dir(),os.scandir(os.path.join(util.fdir,'mods')))
locales=[]
for mod in mods:
  if os.path.exists(os.path.join(mod.path,'locale','en')):
    locales+=[x.path for x in os.scandir(os.path.join(mod.path,'locale','en'))]
locales+=[x.path for x in os.scandir(os.path.join(util.fdir,'data','core','locale','en'))]
locales+=[x.path for x in os.scandir(os.path.join(util.fdir,'data','base','locale','en'))]
locales=[x for x in locales if x.endswith('.cfg')]

locale={}
for file in locales:
  with open(file) as f:
    fdata=f.read()
  
  category=None
  for line in fdata.split('\n'):
    #if 'module' in line:
        #util.debug(category)
        #util.debug(line)
    if line.strip()=='' or line.startswith(';') or line.startswith('#'):
      continue
    if line.startswith('[') and line.endswith(']'):
      category=line[1:-1]
      if category=='': #for the case when the locales are all in one file
          category=None
    else:
      key,value=line.split('=',maxsplit=1)
      if category is None:
        locale[key]=value
      else:
        locale[key]=value #for the case when the locales are all in one file
        locale[category+'.'+key]=value

def localizeR(s):
    return localize(s,True)

def localize(s,recursive=False):
  util.debug(s)
  if type(s)==list:
      if s[0]=='':
          util.debug(s)
          return ''.join(map(localizeR,s[1:]))
      l=locale.get(s[0]) or [None,s[0]][recursive]
      if l is None:
          return None
      for i in range(1,len(s)):
          util.debug(repr(l),repr(i),repr(s[i]))
          l=l.replace('__'+str(i)+'__',localize(s[i],True))
          util.debug(repr(l))
      return l
  if type(s)==int:
      return str(s)
  if recursive:
      return locale.get(s) or s
  return locale.get(s)

def recipelocale(recipe,data=data.data):
  recipe=data['recipe'][recipe]
  return recipelocaleraw(recipe,data)

def recipelocaleraw(recipe,data=data.data):
  util.debug(recipe)
  if 'normal' in recipe:
    recipe=copy.deepcopy(recipe)
    recipe.update(recipe['normal'])
    del recipe['normal']
    return recipelocaleraw(recipe)
  if len(recipe['results'])==1:
    if ('main_product' in recipe and recipe['main_product']==''): #or 'main_product' not in recipe:
      if 'localised_description' not in recipe:
        desc=localize('recipe-description.'+recipe['name'])
      else:
        desc=localize(recipe['localised_description'])
      if 'localised_name' not in recipe:
        name=localize('recipe-name.'+recipe['name'])
      else:
        name=localize(recipe['localised_name'])
      return name,desc
    return itemlocale(recipe['results'][0]['name'],data)
  if 'main_product' in recipe and recipe['main_product']!='':
    return itemlocale(recipe['main_product'],data)
  if 'localised_description' not in recipe:
    desc=localize('recipe-description.'+recipe['name'])
  else:
    desc=localize(recipe['localised_description'])
  if 'localised_name' not in recipe:
    name=localize('recipe-name.'+recipe['name'])
  else:
    name=localize(recipe['localised_name'])
  return name,desc

def entitylocale(entity,data=data.data):
  for etype in util.entitytypes:
    if entity in data[etype]:
      entity=data[etype][entity]
      if 'localised_description' not in entity:
        desc=localize('item-description.'+entity['name'])
      else:
        desc=localize(entity['localised_description'])
      if 'localised_name' not in entity:
        name=localize('entity-name.'+entity['name'])
      else:
        name=localize(entity['localised_name'])
      return name,desc
  return None,None

def itemlocale(item,data=data.data):
  if item=='time':
    return 'Time','Time'
  for itype in util.itemtypes:
    if item in data[itype]:
      item=data[itype][item]
      util.debug(item)
      if 'localised_description' not in item:
        desc=localize('item-description.'+item['name'])
      else:
        desc=localize(item['localised_description'])
      if 'localised_name' not in item:
        name=localize('item-name.'+item['name'])
      else:
        name=localize(item['localised_name'])
      util.pj(name)
      util.pj(desc)
      if 'placed_as_equipment_result' in item:
          name,desc= equipmentlocale(item['placed_as_equipment_result'])
      if not name:
          return entitylocale(item['place_result'])
      return name,desc or ""
  return fluidlocale(item,data)

def fluidlocale(fluid,data=data.data):
  fluid=data['fluid'][fluid]
  if 'localised_description' not in fluid:
    desc=localize('fluid-description.'+fluid['name'])
  else:
    desc=localize(fluid['localised_description'])
  if 'localised_name' not in fluid:
    name=localize('fluid-name.'+fluid['name'])
  else:
    name=localize(fluid['localised_name'])
  return name,desc

def equipmentlocale(equipment,data=data.data):
  for etype in util.equipmenttypes:
      if equipment in data[etype]:
          equipment=data[etype][equipment]
          break
  if 'localised_description' not in equipment:
    desc=localize('equipment-description.'+equipment['name'])
  else:
    desc=localize(equipment['localised_description'])
  if 'localised_name' not in equipment:
    name=localize('equipment-name.'+equipment['name'])
  else:
    name=localize(equipment['localised_name'])
  return name,desc

def techlocale(tech,data=data.data):
    name=tech
    tech=data['technology'][tech]
    util.pj(tech)
    try:
        pf=' '+str(int(name.rsplit('-',maxsplit=1)[1]))
        name=name.rsplit('-',maxsplit=1)[0]
        util.debug(name,pf)
    except:
        pf=''
    if 'localised_description' not in tech:
        desc=localize('technology-description.'+name)
    else:
        desc=localize(tech['localised_description'])
    if 'localised_name' not in tech:
        name=localize('technology-name.'+name)
    else:
        name=localize(tech['localised_name'])
    if pf!='':
        pass#raise Exception
    return name+pf,desc

def techname(tech,data=data.data):
    return techlocale(tech,data)[0]+' (technology)'

def itemname(item,data=data.data):
    return itemlocale(item,data)[0]

def entityname(entity,data=data.data):
    return entitylocale(entity,data)[0]

def recipename(recipe,data=data.data):
    util.debug(recipe)
    return recipelocale(recipe,data)[0]

del f,fdata,line,locales
