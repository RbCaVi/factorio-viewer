function accordionclick() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("accordionactive");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
        panel.style.display = "none";
    } else {
        panel.style.display = "block";
    }
};

function createaccordion(element){
    var container=document.createElement('div');
    var button=document.createElement('button');
    button.classList.add('accordion');
    button.addEventListener('click',accordionclick);
    container.append(button,element);
    return container;
}

export {createaccordion};