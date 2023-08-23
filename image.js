import {promiseChain,packPromise,makePromise} from './util.js';

//function uploadimage(data,uploadname,size=32){
//    if(force||forceimage||!wikiapi.pageexists('File:'+uploadname+'.png')){
//        makeicon(data,size).then(iconcanvas=>wikiapi.upload(iconcanvas.toBlob(),uploadname+'.png'));
//    }
//}

function toObjectURL(canvas){
    if(typeof canvas.convertToBlob=='function'){
        return canvas.convertToBlob().then(URL.createObjectURL);
    }else{
        return new Promise(resolve=>canvas.toBlob(resolve)).then(URL.createObjectURL);
    }
}

function getCanvas(width,height){
    //if(typeof OffscreenCanvas=='function'){
    //    return new OffscreenCanvas(width,height);
    //}else{
        var canvas=document.createElement('canvas');
        canvas.width=width;
        canvas.height=height;
        return canvas;
    //}
}

function loadImage(src){
    return new Promise((resolve,reject)=>{
        var img=new Image();
        img.addEventListener(
            "load",
            ()=>{
                resolve(img);
            },
            false,
        );
        img.addEventListener(
            "error",
            (event)=>{
                reject(event);
            },
            false,
        );
        img.crossOrigin='';
        img.src=src;
    })
}

function colorToString(color){
    return color.reduce((s, channel) => {
        var c = Math.floor(channel).toString(16);
        c = (c.length==1?'0':'')+c;
        s += c;
        return s;
    }, '#')
}

function fixcolor(col){
    // return the color normalized to hex rgba format
    var color={'r':0,'g':0,'b':0,'a':1};
    if(Array.isArray(col)){
        for(var i=0;i<col.length;i++){
            color[['r','g','b','a'][i]]=col[i];
        }
    }else{
        ['r','g','b','a'].map(x=>{color[x]=col[x]});
    }
    if(Math.max(...Object.values(color))<=1){
        ['r','g','b','a'].map(x=>{color[x]*=255});
    }
    return colorToString(['r','g','b','a'].map(i=>color[i]))
}

let iconcache={}

function makeiconURL(data,size=32){
    // return a promise for the canvas being fully rendered
    var cachekey=JSON.stringify({icon:data.icon,icons:data.icons,icon_size:data.icon_size});
    if(cachekey in iconcache){
        console.log(cachekey);
        return makePromise(iconcache[cachekey]);
    }
    if('icons' in data){
        var icons=data.icons;
        var baseiconsize=data.icon_size??icons[0].icon_size;
        var canvas=getCanvas(size,size);
        var parts=[];
        for(var icondata of icons){
            var iconname=icondata.icon;
            var iconsize=icondata.icon_size??baseiconsize;
            parts.push(packPromise(geticon(iconname,iconsize),icondata).then(([icon,idata])=>{
                var icanvas=getCanvas(icon.width,icon.height);
                var ctx=icanvas.getContext("2d");
                if('tint' in idata){
                    var tint=fixcolor(idata.tint);
                    var ctx=icanvas.getContext("2d");
                    ctx.fillStyle=tint;
                    ctx.fillRect(0,0,icanvas.width,icanvas.height);
                }
                ctx.globalCompositeOperation='multiply';
                ctx.drawImage(icon,0,0);
                ctx.globalCompositeOperation='destination-atop';
                ctx.drawImage(icon,0,0);
                ctx.globalCompositeOperation='source-over';
                return [icanvas,idata];
            }));
        }
        return new Promise((resolve,reject)=>
            promiseChain(parts,([icanvas,idata])=>{
                var iconsize=idata.icon_size??baseiconsize;
                var shift=[0,0];
                if('shift' in idata){
                    shift=idata.shift;
                    shift=shift.map(x=>x*(size/baseiconsize)*2); // i don't know why 2
                }
                var isize=iconsize*(size/baseiconsize);
                if('scale' in idata){
                    isize*=idata.scale*2;
                }
                var ctx=canvas.getContext("2d");
                ctx.drawImage(icanvas,(canvas.width-isize)/2+shift[0],(canvas.height-isize)/2+shift[1],isize,isize);
            }).then(()=>{
                return toObjectURL(canvas);
            }).then(url=>{
                iconcache[cachekey]=url;
                resolve(url);
            },
            (error)=>
                reject(error)
            )
        );
    }else{
        var canvas=getCanvas(size,size);
        iconname=data.icon;
        iconsize=data.icon_size;
        return geticon(iconname,iconsize).then(icon=>{
            var ctx=canvas.getContext("2d");
            ctx.drawImage(icon,0,0,size,size);
        }).then(()=>{
            return toObjectURL(canvas);
        }).then(url=>{
            iconcache[cachekey]=url;
            return url;
        });
    }
}

function geticon(name,size){
    return loadImage('mods/'+name).then(image=>{
        return createImageBitmap(image,0,0,size,size);
    });
}

export {makeiconURL};