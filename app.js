// Global selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock")
const closedAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;

// Event Listener
generateBtn.addEventListener("click", randomColors);
sliders.forEach(slider => {
    slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
        updateTextUI(index);
    });
});
currentHexes.forEach(hex => {
    hex.addEventListener("click",() => {
        copyToClipboard(hex);
    })
});
popup.addEventListener("transitioned", () => {
    const popupBox=popup.children[0];
    popup.classList.remove("active");
    popupBox.classList.remove("active");
});
adjustButton.forEach((button, index) => {
    button.addEventListener("click", () => {
        openAdjustmentPanel(index);
    });
});
closedAdjustments.forEach((button, index) => {
    button.addEventListener("click", () => {
        closeAdjustmentPanel(index);
    })
})

// Functions

// Color Generator
function generateHex(){
    const hexColor = chroma.random();
    return hexColor;
    // return chroma.random();

    // const letters = "#0123456789ABCDEF";
    // let hash = '#';
    // for(let i = 0; i< 6; i++){
    //     hash+=letters[Math.floor(Math.random() * 16)];
    // }
    // return hash;
}

function randomColors() {
    initialColors = [];
    

    
    // console.log('divs', colorDivs)
    colorDivs.forEach((div,index) => {
        const hexText = div.children[0];

        const randomColor = generateHex();
        // console.log('hex =', randomColor)
        // adding to the array
        console.log(randomColor.hex());

       if (div.classList.contains("locked")) {
           initialColors.push(hexText.innerText);
           return;
       } else {
        // console.log('hex = ', randomColors)
        initialColors.push(chroma(randomColor).hex());
       }

        // Add the color to the background
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;

        // Check for contrast
        checkTextContrast(randomColor, hexText);

        // initial colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    });
    
    // Reset Inputs
    resetInputs();
    // Check for Button Contrast
    adjustButton.forEach((button, index) => {
        ckeckTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockButton[index])
    });
}

function checkTextContrast(color, text){
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    // Scale saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    // Scale Brightness
    const midBright = color.set("hsl.l", 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);


    // Update Input Colors 
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75),rgb(204, 204, 75),rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}

function hslControls(e) {
    const index = 
    e.target.getAttribute("data-bright") || 
    e.target.getAttribute("data-sat") || 
    e.target.getAttribute("data-hue");
    
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    
    
    const bgColor = initialColors[index];
    

    let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);


    colorDivs[index].style.backgroundColor = color;

    // Colorize sliders
    colorizeSliders(color, hue, brightness, saturation)

}
function updateTextUI(index){
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button");
    textHex.innerText = color.hex();
    // Contrast
    checkTextContrast(color, textHex);
    for (icon of icons) {
        checkTextContrast(color, icon)
    }
}
function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach(slider => {
        if(slider.name === 'hue') {
           const hueColor = initialColors[slider.getAttribute('data-hue')];
           const hueValue = chroma(hueColor).hsl()[0]       
           slider.value = Math.floor(hueValue);
        }
        if(slider.name === 'brightness') {
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];      
            slider.value = Math.floor(brightValue * 100) / 100;
         }
         if (slider.name === "saturation") {
            const satColor = initialColors[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
          }
    });
}
function copyToClipboard(hex) {
    const el = document.createElement("textarea");
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    // Pop up animation
    const popupBox = popup.children[0];
    popup.classList.add("acive")
    popupBox.classList.add("active");

}
function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle("active");

}
function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove("active")
}

randomColors();
// console.log(randomColors)