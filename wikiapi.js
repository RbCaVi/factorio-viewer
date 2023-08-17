import json,requests,os,copy,requests.exceptions

import util

wiki='https://spaceexploration.miraheze.org';

class WikiSession{
    constructor(wiki){
        this.wiki=wiki;
        this.apiendpoint=this.wiki+'/w/api.php';
    }

    login(user,pass){
        query={
            "action":"query",
            "meta":"tokens",
            "type":"login"
        }
        params=new URLSearchParams(query);
        return safeFetch(apiendpoint+'?'+params.toString()).then(
            response=>response.json()
        ).then(
            data=>{
                token=data['query']['tokens']['logintoken'];
                query={
                    "action":"login",
                    "lgname":user,
                    "lgpassword":pass,
                    "lgtoken":token,
                };
                params=new URLSearchParams(query);
                return safeFetch(apiendpoint+'?'+params.toString())
            }
        );
    }
}

csrftoken=None

session=requests.Session()

apiendpoint="https://spaceexploration.miraheze.org/w/api.php"
headers={'User-Agent':"SEAutoUpdate/1.0 (robert@robertvail.info)"}

with open('creds.txt') as f:
    data=f.read()

username=data.split('\n')[0]
password=data.split('\n')[1]

def get(query):
    query=copy.deepcopy(query)
    query.update({
        "formatversion":"2",
        "format":"json",
    })
    while True:
        try:
            response=session.get(url=apiendpoint,params=query,headers=headers)
            data=response.json()
            break
        except requests.exceptions.JSONDecodeError as e:
            print(f'error in GET{json.dumps(query)}, retrying')
            continue
        except requests.exceptions.ConnectionError as e:
            print(f'error in GET{json.dumps(query)}, retrying')
            continue
    return data

def post(query,**kwargs):
    query=copy.deepcopy(query)
    query.update({
        "formatversion":"2",
        "format":"json",
    })
    while True:
        try:
            response=session.post(url=apiendpoint,data=query,headers=headers,**kwargs)
            data=response.json()
            break
        except requests.exceptions.JSONDecodeError as e:
            print(f'error in POST{json.dumps(query)}, retrying')
            continue
        except requests.exceptions.ConnectionError as e:
            print(f'error in POST{json.dumps(query)}, retrying')
            continue
    return data

def getpages(pages):
  query={
    "action":"query",
    "prop":"revisions",
    "rvprop":'|'.join([
        "content",
        #"ids",
        "timestamp"
    ]),
    "rvslots":"main",
    "curtimestamp":"true",
    "titles":"|".join(pages)
  }
  return get(query)

def getcsrftoken():
    global csrftoken
    if csrftoken is None:
        query={
            "action":"query",
            "meta":"tokens"
        }
        try:
            data=get(query)
            csrftoken=data['query']['tokens']['csrftoken']
        except:
            print("Error getting csrf token")
    return csrftoken

def gettimestamp():
    query={
       "action":"query",
       "curtimestamp":"true"
    }
    data=get(query)
    return data["curtimestamp"]

def edit(title,content,start,base='now',summary='Automatically edited by SEAutoUpdate',minor=False,createonly=True):
    token=getcsrftoken()
    if not token:
        print("edit failed: no token")
        return
    query={
       "action":"edit",
       "title":title,
       "text":content,
       "summary":summary,
       "basetimestamp":base,
       "starttimestamp":start,
       "token":token,
       "bot":"true",
    }
    if not minor:
        query['notminor']='true'
    if createonly:
        query['createonly']='true'

    data=post(query)
    return data

def read_chunks(file,size=1024):
    while True:
        data=file.read(size)
        if not data:
            break
        yield data

def upload(filename,uploadname,comment='Uploaded by SEAutoUpdate',chunksize=16384):
    """Send multiple post requests to upload a file in chunks using `stash` mode.
    Stash mode is used to build a file up in pieces and then commit it at the end
    """
    
    file=open(filename,'rb')
    size=os.stat(filename).st_size
    
    token=getcsrftoken()
    if not token:
        print("upload failed: no token")

    chunks = read_chunks(file,chunksize)
    chunk = next(chunks)

    # Parameters for the first chunk
    params = {
        "action": "upload",
        "stash": 1,
        "filename": uploadname,
        "filesize": size,
        "offset": 0,
        "token": token,
        "ignorewarnings": 1
    }
    index = 0
    filedata = {'chunk':('{}.jpg'.format(index), chunk, 'multipart/form-data')}
    index += 1
    data=post(params, files=filedata)
    util.pj(data)

    # Pass the filekey parameter for second and further chunks
    for chunk in chunks:
        params = {
            "action": "upload",
            "stash": 1,
            "offset": data["upload"]["offset"],
            "filename": uploadname,
            "filesize": size,
            "filekey": data["upload"]["filekey"],
            "token": token,
            "ignorewarnings": 1
        }
        filedata = {'chunk':('{}.jpg'.format(index), chunk, 'multipart/form-data')}
        index += 1
        data=post(params, files=filedata)
        util.pj(data)

    # Final upload using the filekey to commit the upload out of the stash area
    params = {
        "action": "upload",
        "filename": uploadname,
        "filekey": data["upload"]["filekey"],
        "comment": comment,
        "token": token,
        "ignorewarnings":1
    }
    data=post(params)
    util.pj(data)

def pageexists(title):
    params={
      "formatversion":"2",
      "format":"json",
      'action':'query',
      'prop':'revisions',
      'titles':title,
      'rvlimit':'5',
      'rvprop':'ids',
    }
    data=get(params)
    util.pj(data)
    return 'missing' not in data['query']['pages'][0]

#pj(getpages(['umbrella']))

login(username,password)

#file="/storage/emulated/0/Download/usb.jpg"

#upload(file,'usb-data-card.jpg')

gettimestamp()