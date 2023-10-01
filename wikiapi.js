import {clone} from './util.js';

var headers={'User-Agent':"SEAutoUpdate/1.0 (robert@robertvail.info)","Origin":""+window.location};
//var headers={};

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
    params.origin='*';
    //params.callback='f';
    params=new URLSearchParams(params);
    return safeFetch(url+'?'+params.toString(),{'headers':headers,'mode':'no-cors'}).then(
        response=>response.json()
    );
}

function post(url,params,body){
    params=clone(params);
    params.formatversion="2";
    params.format="json";
    params.origin='*';
    //params.callback='f';
    params=new URLSearchParams(params);
    var options={'method':'post','headers':headers};
    if(body){
        options.body=body;
    }
    return safeFetch(url+'?'+params.toString(),options).then(
        response=>response.json()
    );
}

function *read_chunks(blob,size){
    var offset=0;
    while(true){
        data=blob.slice(offset,offset+size);
        if(data.size==0){
            break;
        }
        yield data;
    }
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
        return get(this.apiendpoint,query).then(data=>data.parse.text);
    }

    getpageswikitext(pages){
        var query={
            "action":"query",
            "prop":"revisions",
            "rvprop":"content|timestamp",
            "rvslots":"main",
            "curtimestamp":"true",
            "titles":pages.join("|")
        };
        return get(this.apiendpoint,query).then(data=>{
            console.log(data);
            var out={};
            for(var page of data.query.pages){
                out[page.title]=page.revisions[0].slots.main.content;
            }
            return out;
        });
    }

    gettimestamp(){
        query={
           "action":"query",
           "curtimestamp":"true"
        };
        return get(this.apiendpoint,query).then(data=>data.curtimestamp);
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
            return post(this.apiendpoint,query);
        });
    }

    upload(file,uploadname,comment='Uploaded by SEAutoUpdate',chunksize=16384){
        //Send multiple post requests to upload a file in chunks using `stash` mode.
        //Stash mode is used to build a file up in pieces and then commit it at the end
        
        size=file.size;
        chunks = read_chunks(file,chunksize);
        var {value:chunk} = next(chunks);
        
        return getcsrftoken().then(token=>{
            // Parameters for the first chunk
            var params = {
                "action": "upload",
                "stash": 1,
                "filename": uploadname,
                "filesize": size,
                "offset": 0,
                "token": token,
                "ignorewarnings": 1
            };
            var index = 0;
            var filedata=new FormData();
            filedata.append('chunk',new File(chunk,index+'.jpg',{'type':'multipart/form-data'}))
            var p=post(this.apiendpoint,params,filedata);

            // Pass the filekey parameter for second and further chunks
            for(var chunk of chunks){
                index += 1;
                p=p.then(data=>{
                    var params = {
                        "action": "upload",
                        "stash": 1,
                        "offset": data.upload.offset,
                        "filename": uploadname,
                        "filesize": size,
                        "filekey": data.upload.filekey,
                        "token": token,
                        "ignorewarnings": 1
                    };
                    var filedata=new FormData();
                    filedata.append('chunk',new File(chunk,index+'.jpg',{'type':'multipart/form-data'}))
                    return post(this.apiendpoint,params,filedata);
                });
            }
            return p.then(data=>{
                // Final upload using the filekey to commit the upload out of the stash area
                params = {
                    "action": "upload",
                    "filename": uploadname,
                    "filekey": data.upload.filekey,
                    "comment": comment,
                    "token": token,
                    "ignorewarnings":1
                };
                return post(this.apiendpoint,params);
            })
        });
    }

    pagesexist(pages){
        params={
          'action':'query',
          'prop':'revisions',
          'titles':pages.join("|"),
          'rvlimit':'5',
          'rvprop':'ids',
        };
        return get(this.apiendpoint,query).then(data=>{
            var out={};
            for(var page of data.query.pages){
                out[page.title]=!('missing' in page);
            }
            return out;
        });
    }
}
export {WikiSession};