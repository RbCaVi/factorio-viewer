import process,locales as locale,towiki,data,wikiapi
import json
import re

process.init()
data.init()

def f(fluid,group='intermediate-products'):
	recipenames=process.produces["normal"].get(fluid,[])
	consumers=process.uses["normal"].get(fluid,[])

	idata=process.getitem(fluid)
	realname=locale.fluidlocale(fluid,data.data)[0]
	info=towiki.towikifluid(fluid,group)
	info=towiki.towikirecipe(recipenames,info)
	info=towiki.addconsumers(consumers,info)
	infobox=towiki.toinfobox(info)
	return infobox

def i(item,group='intermediate-products'):
	recipenames=process.produces["normal"].get(item,[])
	consumers=process.uses["normal"].get(item,[])

	idata=process.getitem(item)
	realname=locale.itemlocale(item,data.data)[0]
	info=towiki.towikiitem(item)
	info=towiki.towikirecipe(recipenames,info)
	info=towiki.addconsumers(consumers,info)
	if len(recipenames)==0:
	  info['producers']=silos # the only items without a recipe producing them are rocket launch products
	infobox=towiki.toinfobox(info)
	return infobox

#print(infobox)

silos=['rocket-silo','se-space-probe-rocket-silo']

fluids=['se-pyroflux','se-molten-iron', 'se-molten-copper', 'se-molten-holmium', 'se-molten-beryllium']
items=['steel-plate','se-satellite-telemetry']

fiboxes=[f(fluid) for fluid in fluids]
iiboxes=[i(item) for item in items]

for ib in fiboxes:
	print(ib)

for ib in iiboxes:
	print(ib)

pdata=wikiapi.getpages(['pyroflux'])
content=pdata['query']['pages'][0]['revisions'][0]['slots']['main']['content']
print(content)
match=re.match(r'({{[^}]*}})([\s\S]*)',content)
if match is not None:
	pinfobox,prest=match.groups()
	print(pinfobox,prest)