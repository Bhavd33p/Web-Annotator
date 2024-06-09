const palette = document.querySelector('.row');

const styles = {
  textColor: "",
  backgroundColor: "",
  borderColor: "",
  textDecorationColor: "",
  opacity: "",
  borderWidth: "",
  textDecorationThickness: "",
  borderStyle: "",
  textDecorationStyle: "",
}

for(let i = 0; i<=10; i++){
  palette.children[i].addEventListener('click', (e)=>{
    const selectedColor = e.target.getAttribute('data-color');
    styles.textColor = selectedColor;
    styles.backgroundColor = selectedColor;
    styles.borderColor = selectedColor;
    styles.textDecorationColor = selectedColor;
    chrome.runtime.sendMessage({type: "UPDATE_STYLES", styles});
  })
}

const customColorInput = palette.children[11];
customColorInput.addEventListener("input", ()=>{
  styles.textColor = customColorInput.value;
  styles.backgroundColor = customColorInput.value;
  styles.borderColor = customColorInput.value;
  styles.textDecorationColor = customColorInput.value;
  chrome.runtime.sendMessage({type: "UPDATE_STYLES", styles});
})