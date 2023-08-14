import json,shutil,os,subprocess,signal

import util
import fix

import sys

regen=False

def getmods():
  mods=[*filter(lambda x:x.is_dir(),os.scandir(os.path.join(util.fdir,'mods')))]
#  mods=[mod.name.rsplit('_',maxsplit=1)[0] for mod in mods]
  nmods=[]
  for mod in mods:
    if mod.name.endswith('.zip'):
      nmods.append(mod.name.rsplit('_',maxsplit=1)[0])
    else:
      with open(os.path.join(mod.path,'info.json')) as f:
        nmods.append(json.load(f)['name'])
  return nmods

if regen:
  try:
    shutil.rmtree(os.path.join(util.fdir,'mods/datalogger'))
  except:
    pass

  info={
    "name": "datalogger",
    "version": "0.0.1",
    "title": "Log the entire data.raw table",
    "author": "A person named Robert",
    "factorio_version": "1.1",
    "dependencies": getmods()
  }
  shutil.copytree('datalogger',os.path.join(util.fdir,'mods/datalogger'))
  with open(os.path.join(util.fdir,'mods/datalogger/info.json'),'w') as f:
    json.dump(info,f,indent=2)

d=os.getcwd()
os.chdir(util.fdir)
if regen:
  subprocess.run(util.fexe+['--create','saves/protodump.zip'])
  fproc=subprocess.Popen(util.fexe+['--start-server','saves/protodump.zip'],stdout=subprocess.PIPE,text=True)
  outf=fproc.stdout
else:
  #fproc=subprocess.Popen(['cat','factorio-current.log'],stdout=subprocess.PIPE,text=True)
  outf=open(os.path.join(util.fdir,'factorio-current.log'))
  print('from saved log')
#outf=fproc.stdout

fout=''
while True:
  out=outf.read(4096)
  fout=fout+out
  if 'Hosting game at' in out+fout[-20:]:
    break

outf.close()

if regen:
  fproc.send_signal(signal.SIGINT)

data=fout.split('__datalogger__/data-final-fixes.lua')[2]
data=data.split(' ',maxsplit=1)[1].rsplit('\n',maxsplit=1)[0]
data=json.loads(data)
data['recipe']={x:fix.fixrecipe(data['recipe'][x]) for x in data['recipe']}
data['technology']={x:fix.fixtech(data['technology'][x]) for x in data['technology']}
#print(fout)

os.chdir(d)

import process

def init():
    global pdata
    pdata={}
    pdata['recipe']={x:process.processrecipe(x) for x in data['recipe']}
    pdata['technology']={x:process.processtech(x) for x in data['technology']}