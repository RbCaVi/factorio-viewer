//function uploadimage(data,uploadname,size=32){
//    if(force||forceimage||!wikiapi.pageexists('File:'+uploadname+'.png')){
//        makeicon(data,size).then(iconcanvas=>wikiapi.upload(iconcanvas.toBlob(),uploadname+'.png'));
//    }
//}

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

function colorToString(color){
    return color.reduce((s, channel) => {
        s += channel.toString(16);
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
    if(Math.max(...Object.values(color))<=1)
        ['r','g','b','a'].map(x=>{color[x]*=255});
    return colorToString(['r','g','b','a'].map(i=>color[i]))
}

function makeicon(data,size=32){
    // return a promise for the canvas being fully rendered
    if('icons' in data){
        var icons=data.icons;
        var baseiconsize=data.icon_size;
        var canvas=OffscreenCanvas(size,size);
        var parts=[];
        for(var icondata of icons){
            var iconname=icondata.icon;
            var iconsize=icondata.icon_size??baseiconsize;
            parts.push(geticon(iconname,iconsize).then(icon=>{
                var icanvas=OffscreenCanvas(icon.width,icon.height);
                var ctx=icanvas.getContext("2d");
                ctx.drawImage(icon,0,0);
                return icanvas;
            }).then(icanvas=>{
                if('tint' in icondata){
                    var tint=fixcolor(icondata.tint);
                    var ctx=icanvas.getContext("2d");
                    ctx.globalCompositeOperation='multiply';
                    ctx.fillStyle=color;
                    ctx.rect(0,0,icanvas.width,icanvas.height);
                    ctx.globalCompositeOperation='source-over';
                }
                return icanvas;
            }));
        }
        return new Promise((resolve,reject)=>
            promiseChain(parts,icanvas=>{
                var shift=[0,0];
                if('shift' in icondata){
                    shift=icondata.shift;
                }
                var isize=size;
                if('scale' in icondata){
                    isize=iconsize*icondata.scale*(baseiconsize/size);
                }
                var ctx=canvas.getContext("2d");
                ctx.drawImage(icanvas,(icanvas.width-isize)/2-shift[0],(icanvas.height-isize)/2-shift[1],isize,isize);
            }).then(()=>
                resolve(canvas),
            (error)=>
                reject(error),
            )
        )
    }else{
        var canvas=OffscreenCanvas(size,size);
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
    return loadImage(name).then(image=>{
        return createImageBitmap(image,0,0,size,size);
    });
}

export {makeicon};