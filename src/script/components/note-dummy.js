import notesData from "../data/local/data.js";

class NotesDummy extends HTMLElement {
  _shadowRoot = null;
  _style = null;
  _notesDataDummy = null;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._style = document.createElement("style");
    this._notesDataDummy = notesData;

    document.addEventListener(
      "notesDataDummyChanged",
      this._handleNotesDataDummyChange.bind(this),
    );
  }

  _updateStyle() {
    this._style.textContent = `
        .notes-container{
        display: grid;
        gap: 2rem;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        padding: 5px 25px;
        }

        .note-box {
        border: 0;
        padding: 0px 20px;
        background-color: #f8f0e5;
        box-shadow: 0 3px 7px 0 rgba(0, 0, 0, .13), 0 1px 2px 0 rgba(0, 0, 0, .11);
        word-wrap: break-word;
        animation: fadeInAnimation 0.5s ease-in-out forwards;
        opacity: 0;
        }

        #createdAt {
        font-size: 12px;
        margin-bottom: 20px;
        }

        @keyframes fadeInAnimation {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
  }

  _emptyContent() {
    this._shadowRoot.innerHTML = "";
  }

  connectedCallback() {
    this.render();
  }

  updateNotesData(newNotesDataDummy) {
    this._notesDataDummy = newNotesDataDummy;
    this.render();
  }

  _renderNotes() {
    const notesContainer = document.createElement("div");
    notesContainer.className = "notes-container";

    this._notesDataDummy.forEach((note) => {
      const noteBox = document.createElement("div");
      noteBox.className = "note-box";
      noteBox.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.body}</p>
        <p id='createdAt'>${note.createdAt}</p>
      `;
      notesContainer.appendChild(noteBox);
    });

    return notesContainer;
  }

  render() {
    this._emptyContent();
    this._updateStyle();
    this._shadowRoot.appendChild(this._style);
    this._shadowRoot.appendChild(this._renderNotes());
  }

  _handleNotesDataDummyChange(event) {
    this._notesDataDummy = event.detail.newNotesDataDummy;
    this.render();
  }
}

customElements.define("notes-dummy", NotesDummy);
