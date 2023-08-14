import util
import data
import process
import os
import json

file='todo.txt'

entries=[]

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

def addtech(name):
    entries.append({'type':'tech','name':name})

def addrecipe(name):
    entries.append({'type':'recipe','recipes':[name]})

def addrecipes(names):
    entries.append({'type':'recipe','recipes':names})

def additem(name,recipes=None,consumers=None):
    if recipes is None:
        recipes=process.produces["normal"].get(name,[])
    if consumers is None:
        consumers=process.uses["normal"].get(name,[])
    entries.append({'type':'item','name':name,'recipes':recipes,'consumers':consumers})

def addfluid(name,group,recipes=None,consumers=None):
    if recipes is None:
        recipes=process.produces["normal"].get(name,[])
    if consumers is None:
        consumers=process.uses["normal"].get(name,[])
    entries.append({'type':'fluid','name':name,'group':group,'recipes':recipes,'consumers':consumers})

#datacards=[x for x in data.data['recipe'] if 'data' in x]

#util.pj(datacards)

#print(len(datacards))

cards=[x for x in data.data['item'] if 'data' in x]
cards.remove('se-junk-data')
cards.remove('se-empty-data')
cards.remove('se-broken-data')
#util.pj([(card,process.produces['normal'].get((card,'item'))) for card in cards])
spacks=[x for x in data.data['tool'] if 'science' in x]
sims=[x for x in data.data['recipe'] if 'simulation' in x]
formats=[x for x in data.data['recipe'] if 'formatting' in x]
insights=[x for x in data.data['item'] if 'insight' in x]
cats=[x for x in data.data['item'] if 'catalogue' in x]
fluids=[x for x in data.data['fluid'] if 'coolant' in x]
#sys.exit()
#util.pj(data.data['recipe'][datacards[0]])
#util.pj(data.data['recipe']['se-formatting-1'])
#util.pj(processrecipe(datacards[0]))
#util.pj(list(set([data.data['item-subgroup'][data.data['item'][x].get('subgroup','other')]['group'] for x in data.data['item']])))

#puttechonwiki('se-space-supercomputer-1')
#util.pj({i:process.produces["normal"][(i,"tool")] for i in spacks})
#print([*map(ord,input())])
#[puttechonwiki(i) for i in spacks if i!="automation-science-pack"]
#puttechonwiki('space-science-pack')
#[putitemonwiki(i) for i in spacks]
#print(set(sum(process.madein.values(),[])))
#print([i for i in fluids if (i,'fluid') in process.produces["normal"]])
#[addfluid(i,'Science') for i in fluids if (i,'fluid') in process.produces["normal"]]

def test(x):
    for s in ['robot','bio-','damage','-speed','rocket','spaceship','art','bra','exp','fl','min','ins']:
        if s in x:
            return False
    try:
        int(x.rsplit('-',maxsplit=1)[1])
        return True
    except:
        return False

read()
entries=[]
for i in data.data['technology']:
    pass
    '''if 'holmium' in i:
        print(i)
        print(data.data['technology'][i])
        print(process.prereqs['normal'][i])
        print(process.postreqs['normal'][i])'''
    if test(i) and '' in i:
        print(i)
    if test(i):
        pass
        addtech(i)

#[additem(i) for i in sum([cards,spacks,insights,cats],[])]
#[addtech(i) for i in data.data['technology'] if 'catalogue' in i or 'science' in i]



write()