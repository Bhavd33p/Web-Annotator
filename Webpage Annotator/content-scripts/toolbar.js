const styled = ({ display = "inline-flex", visibility = "hidden", left, top, animation = "none" }) => `
  #mediumHighlighter {
    align-items: center;
    border: none;
    cursor: pointer;
    justify-content: center;
    left: ${left}px;
    display: ${display};
    visibility: ${visibility};
    padding: 5px 10px;
    position: fixed;
    top: ${top}px;
    z-index: 9999;
    animation: ${animation} 0.5s ease-in-out;
  }
`;

class Toolbar extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  get toolbarPosition() {
    return JSON.parse(this.getAttribute("toolbarPosition") || "{}");
  }

  get styleElement() {
    return this.shadowRoot.querySelector("style");
  }

  get highlightTemplate() {
    return this.shadowRoot.getElementById("highlightTemplate");
  }

  get rectangle() {
    return this.shadowRoot.getElementById("rectangle");
  }

  get circle() {
    return this.shadowRoot.getElementById("circle");
  }

  get underline() {
    return this.shadowRoot.getElementById("underline");
  }

  get fontColor() {
    return this.shadowRoot.getElementById("fontColor");
  }

  get fontSize() {
    return this.shadowRoot.getElementById("fontSize");
  }

  get toolbar() {
    return this;
  }

  static get observedAttributes() {
    return ["toolbarPosition"];
  }

  async loadTemplate() {
    const response = await fetch(chrome.runtime.getURL('src/annotatorToolbar.html'));
    const template = await response.text();
    this.shadowRoot.innerHTML += template;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "toolbarPosition") {
      this.styleElement.textContent = styled(this.toolbarPosition);
    }
  }

  setIconImage(className) {
    const e = this.shadowRoot.querySelector(`.${className}`);
    e.style.background = `url(${chrome.runtime.getURL(`images/${className}.png`)}) no-repeat center center/cover`;
    if (className != "circle") e.style.backgroundSize = "80%";
  }

  render() {
    this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styled({});
    this.shadowRoot.appendChild(style);

    this.loadTemplate().then(() => {
      setImages(this);
      appendTools(this);
    });
  }
}

window.customElements.define("annotator-toolbar", Toolbar);

const toolbar = document.createElement("annotator-toolbar");
document.body.appendChild(toolbar);

const setToolbarPosition = (toolbarPosition) =>
  toolbar.setAttribute(
    "toolbarPosition",
    JSON.stringify(toolbarPosition)
  );

const getSelectedText = () => window.getSelection().toString();

document.addEventListener("click", () => {
  if (getSelectedText().length > 0) {
    setToolbarPosition(getToolbarPosition());
  }
});

document.addEventListener("selectionchange", () => {
  if (getSelectedText().length === 0) {
    setToolbarPosition({
      visibility: "hidden",
      animation: "none"
    });
  }
});

function getToolbarPosition() {
  const p = toolbar.shadowRoot.querySelector('.container').getBoundingClientRect();
  const rangeBounds = window
    .getSelection()
    .getRangeAt(0)
    .getBoundingClientRect();

  return {
    left: Math.max(Number.parseInt(rangeBounds.left + rangeBounds.width / 2 - p.width / 2), 0),
    top: Math.max(Number.parseInt(rangeBounds.top - p.height), 0),
    display: "inline-flex",
    visibility: "visible",
    animation: "tickle"
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SHORTCUT_TRIGGERED") {
    const className = message.className;
    const element = document.querySelector('annotator-toolbar').shadowRoot.querySelector(`.${className}`);
    element.click();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "UPDATE_PROPERTIES") {
    updated_properties = message.properties;
  }
});

const old_properties = {
  color: "",
  backgroundColor: "",
  borderColor: "",
  textDecorationColor: "",
  opacity: "",
  borderWidth: "",
  textDecorationThickness: "",
  borderStyle: "",
  textDecorationStyle: "",
};

let updated_properties = old_properties;

const appendTools = (element) => {
  append(element, 'text-marker', element.highlightTemplate);
  append(element, 'rectangle', element.rectangle);
  append(element, 'circle', element.circle);
  append(element, 'underline', element.underline);
  append(element, 'fontColor', element.fontColor);
  append(element, 'fontSize', element.fontSize);
}

const setImages = (element) => {
  for (let box of element.shadowRoot.querySelectorAll('.box')) {
    element.setIconImage(box.classList[1]);
  }
}

function append(element, query, template) {
  element.shadowRoot.querySelector(`.${query}`).addEventListener("click", () => { handleClick(template) });
}

const handleClick = (template) => {
  for (let attr of template.attributes) {
    const attrName = attr.name;

    if (updated_properties.hasOwnProperty(attrName)) {
      template.setAttribute(attrName, updated_properties[attrName] || template.getAttribute(attrName));
    }
  }

  updated_properties = old_properties;
  const userSelection = window.getSelection();
  for (let i = 0; i < userSelection.rangeCount; i++) {
    const range = userSelection.getRangeAt(i);
    const clone = template.cloneNode(true).content.firstElementChild;

    clone.style.backgroundColor = template.getAttribute('backgroundColor');
    clone.style.opacity = template.getAttribute('opacity');
    clone.style.borderColor = template.getAttribute('borderColor');
    clone.style.borderWidth = template.getAttribute('borderWidth');
    clone.style.borderStyle = template.getAttribute('borderStyle');
    clone.style.textDecorationColor = template.getAttribute('textDecorationColor');
    clone.style.textDecorationStyle = template.getAttribute('textDecorationStyle');
    clone.style.textDecorationThickness = template.getAttribute('textDecorationThickness');
    clone.style.color = template.getAttribute('color');

    clone.appendChild(range.extractContents());
    range.insertNode(clone);
  }
  window.getSelection().empty();
}
