//function uploadimage(data,uploadname,size=32){
//    if(force||forceimage||!wikiapi.pageexists('File:'+uploadname+'.png')){
//        makeicon(data,size).then(iconcanvas=>wikiapi.upload(iconcanvas.toBlob(),uploadname+'.png'));
//    }
//}
function getimage(data,size) {
    return makeicon(data,size).then(iconcanvas=>{
        var img=document.createElement('img');
        img.src=iconcanvas.toDataURL('image/png');
        document.querySelector('body').append(img);
        return img;
    });
}

function getOffscreenCanvas(width,height){
    return new OffscreenCanvas(width,height);
}

function getDOMCanvas(width,height){
    var canvas=document.createElement('canvas');
    canvas.width=width;
    canvas.height=height;
    return canvas;
}
let getCanvas;

if(typeof OffscreenCanvas=='function'){
    getCanvas=getOffscreenCanvas
}else{
    getCanvas=getDOMCanvas
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

function promiseChain(ps,f){
    // ps is an array of promises
    // f is a one argument function
    // it calls f on the data from each promise in order and returns the resulting promise
    return ps.reduce((p1,p2)=>{
        return p1.then(data1=>{
            f(data1);
            return p2;
        })
    }).then(data=>{
        f(data);
    });
}
function packPromise(p,data){
    // puts a data value into a promise
    return p.then(pdata=>[pdata,data]);
}

function colorToString(color){
    console.log(color);
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
    console.log(color);
    return colorToString(['r','g','b','a'].map(i=>color[i]))
}

function makeicon(data,size=32){
    // return a promise for the canvas being fully rendered
    if('icons' in data){
        var icons=data.icons;
        var baseiconsize=data.icon_size;
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
                    console.log(tint);
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
                }
                var isize=iconsize*(size/baseiconsize);
                if('scale' in idata){
                    isize*=idata.scale;
                }
                var ctx=canvas.getContext("2d");
                ctx.drawImage(icanvas,(canvas.width-isize)/2+shift[0],(canvas.height-isize)/2+shift[1],isize,isize);
            }).then(()=>
                resolve(canvas),
            (error)=>
                reject(error),
            )
        )
    }else{
        var canvas=getCanvas(size,size);
        iconname=data.icon;
        iconsize=data.icon_size;
        return geticon(iconname,iconsize).then(icon=>{
            var ctx=canvas.getContext("2d");
            ctx.drawImage(icon,0,0,size,size);
            return canvas;
        });
    }
}

function geticon(name,size){
    return loadImage('mods/'+name).then(image=>{
        return createImageBitmap(image,0,0,size,size);
    });
}

export {makeicon,getimage};