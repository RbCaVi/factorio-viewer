import json,requests,os,copy,requests.exceptions

import util

wiki='https://spaceexploration.miraheze.org';

headers={'User-Agent':"SEAutoUpdate/1.0 (robert@robertvail.info)"}

function safeFetch(...args) {
    return fetch(...args).then(response => {
        if (!response.ok) {
            throw new Error("Failed with HTTP code " + response.status);
        }
        return response;
    });
}

function get(url,params){
    params=clone(params);
    params.formatversion="2";
    params.format="json";
    params=new URLSearchParams(params);
    return safeFetch(url+'?'+params.toString(),{'headers':headers}).then(
        response=>response.json()
    );
}

function post(url,params){
    params=clone(params);
    params.formatversion="2";
    params.format="json";
    params=new URLSearchParams(params);
    return safeFetch(url+'?'+params.toString(),{'method':'post','headers':headers}).then(
        response=>response.json()
    );
}

class WikiSession{
    constructor(wiki){
        this.wiki=wiki;
        this.apiendpoint=this.wiki+'/w/api.php';
    }

    login(user,pass){
        var query={
            "action":"query",
            "meta":"tokens",
            "type":"login"
        }
        return get(this.apiendpoint,query).then(data=>{
            var token=data.query.tokens.logintoken;
            var query={
                "action":"login",
                "lgname":user,
                "lgpassword":pass,
                "lgtoken":token,
            };
            return post(this.apiendpoint,query);
        });
    }

    getcsrftoken(){
        if(this.csrftoken==undefined){
            var query={
                "action":"query",
                "meta":"tokens"
            }
            return get(this.apiendpoint,query).then(data=>{
                this.csrftoken=data.query.tokens.csrftoken;
                return this.csrftoken;
            });
        }else{
            return new Promise((resolve)=>this.csrftoken);
        }
    }

    getpagehtml(page){
        var query={
            "action":"parse",
            "prop":"text",
            "rvslots":"main",
            "page":page
        };
        return get(apiendpoint,query).then(data=>data.parse.text);
    }

    getpageswikitext(pages){
        query={
            "action":"query",
            "prop":"revisions",
            "rvprop":"content|timestamp",
            "rvslots":"main",
            "curtimestamp":"true",
            "titles":pages.join("|")
        };
        return get(apiendpoint,query).then(data=>{
            var out={};
            for(var page of data.query.pages){
                out[page.title]=page.revisions[0].content;
            }
            return out;
        });
    }

    gettimestamp(){
        query={
           "action":"query",
           "curtimestamp":"true"
        };
        return get(apiendpoint,query).then(data=>data.curtimestamp);
    }
    
    edit(title,content,start,base='now',summary='Automatically edited by SEAutoUpdate',minor=false,createonly=true){
        return getcsrftoken().then(token=>{
            query={
               "action":"edit",
               "title":title,
               "text":content,
               "summary":summary,
               "basetimestamp":base,
               "starttimestamp":start,
               "token":token,
               "bot":"true"
            };
            if(!minor){
                query.notminor='true';
            }
            if(createonly){
                query.createonly='true';
            }
            return post(query);
        });
    }
}


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

gettimestamp()