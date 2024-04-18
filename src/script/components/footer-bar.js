class FooterBar extends HTMLElement {
  _shadowRoot = null;
  _style = null;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._style = document.createElement("style");
  }

  _updateStyle() {
    this._style.textContent = `
      :host {
        display: block;

        color: #F8F0E5;
        background-color: #102C57;
      }
 
      div {
        padding: 20px 50px;
 
        text-align: center;
      }
    `;
  }

  _emptyContent() {
    this._shadowRoot.innerHTML = "";
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this._emptyContent();
    this._updateStyle();

    this._shadowRoot.appendChild(this._style);
    this._shadowRoot.innerHTML += `      
      <div>
        Ilham Rafi Fadhilah &copy; SIB Dicoding Cycle 6 2024
      </div>
    `;
  }
}

customElements.define("footer-bar", FooterBar);
