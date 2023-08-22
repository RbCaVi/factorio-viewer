function accordionclick() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("accordionactive");

    /* Toggle between hiding and showing the active panel */
    var panel = this.parentElement.nextElementSibling;
    if (panel.style.display === "block") {
        panel.style.display = "none";
    } else {
        panel.style.display = "block";
    }
};

function createaccordion(header,element){
    var container=document.createElement('div');
    var headerdiv=document.createElement('div');
    var button=document.createElement('button');
    button.classList.add('accordion');
    button.addEventListener('click',accordionclick);
    headerdiv.append(button);
    if(header!=undefined){
        headerdiv.append(header);
    }
    container.append(headerdiv,element);
    element.style.display='none';
    element.classList.add('accordionbody');
    return container;
}

function fromjson(data){
    switch(typeof data){
        case "string":
        case "number":
        case "boolean":
            var div=document.createElement('div');
            div.textContent=JSON.stringify(data);
            return div;
        case "object":
            if (!data){
                var div=document.createElement('div');
                div.textContent='null';
                return div;
            }
            if(Array.isArray(data)){
                var div=document.createElement('div');
                for(var i=0;i<data.length;i++) {
                    div.append(createaccordion(undefined,fromjson(data[i])));
                }
                return div;
            }
            var div=document.createElement('div');
            for(var key in data){
                div.append(createaccordion(key,fromjson(data[key])));
            }
            return div;
        default:
            var div=document.createElement('div');
            div.textContent='null';
            return div;
    }
}

export {createaccordion,fromjson};