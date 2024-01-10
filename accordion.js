function accordionclick() {
  /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
  this.classList.toggle("accordionactive");

  /* Toggle between hiding and showing the active panel */
  let panel = this.parentElement.nextElementSibling;
  if (panel.style.display === "block") {
    panel.style.display = "none";
  } else {
    panel.style.display = "block";
  }
}

function createaccordion(header,element){
  let container=document.createElement("div");
  let headerdiv=document.createElement("div");
  let button=document.createElement("button");
  button.classList.add("accordion");
  button.addEventListener("click",accordionclick);
  headerdiv.append(button);
  if(header!=undefined){
    headerdiv.append(header);
  }
  container.append(headerdiv,element);
  element.style.display="none";
  element.classList.add("accordionbody");
  return container;
}

function fromjson(data){
  let div;
  switch(typeof data){
  case "string":
  case "number":
  case "boolean":
    div=document.createElement("div");
    div.textContent=JSON.stringify(data);
    return div;
  case "object":
    if (!data){
      div=document.createElement("div");
      div.textContent="null";
      return div;
    }
    if(Array.isArray(data)){
      div=document.createElement("div");
      for(let i=0;i<data.length;i++) {
        div.append(createaccordion(undefined,fromjson(data[i])));
      }
      return div;
    }
    div=document.createElement("div");
    for(let key in data){
      div.append(createaccordion(key,fromjson(data[key])));
    }
    return div;
  default:
    div=document.createElement("div");
    div.textContent="null";
    return div;
  }
}

export {createaccordion,fromjson};