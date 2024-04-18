import notesData from "../data/local/data.js";
import NotesApi from "../data/remote/notes-api.js";
import Swal from "sweetalert2";

class NoteForm extends HTMLElement {
  _shadowRoot = null;
  _style = null;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._style = document.createElement("style");
    this._loadingElement = document.createElement("my-loading");
  }

  _updateStyle() {
    this._style.textContent = `
        :host {
        padding: 5px 25px;
        box-shadow: 0 3px 7px 0 rgba(0, 0, 0, .13), 0 1px 2px 0 rgba(0, 0, 0, .11);
        }

        .form-element {
        margin-bottom: 20px;
        text-align: left;
        }

        input[type="text"],
        textarea {
        border: 1px solid #102c57;
        border-radius: 8px;
        padding: 10px;
        box-sizing: border-box;
        width: 100%;
        background-color: #F8F0E5;
        }

        input[type="submit"] {
        margin-bottom: 20px;
        border: 1px solid #102c57;
        border-radius: 8px;
        padding: 10px 30px;
        box-sizing: border-box;
        background-color: #102c57;
        color: white;
        width: 100%;
        }

        input[type="submit"]:hover {
        cursor: pointer;
        background-color: white;
        color: #102c57;
        font-weight: bold;
        }

        .validation-message {
        margin-block-start: 0.5rem;
        color: red;
        }
    `;
  }

  _emptyContent() {
    this._shadowRoot.innerHTML = "";
  }

  connectedCallback() {
    this.render();
    this._shadowRoot
      .querySelector("#noteForm")
      .addEventListener("submit", this._handleSubmit.bind(this));

    const titleInput = this._shadowRoot.querySelector("#title");
    const bodyInput = this._shadowRoot.querySelector("#body");

    titleInput.addEventListener("input", this._handleTitleInput.bind(this));
    bodyInput.addEventListener("input", this._handleBodyInput.bind(this));

    titleInput.addEventListener("blur", this._handleTitleBlur.bind(this));
    bodyInput.addEventListener("blur", this._handleBodyBlur.bind(this));
  }

  render() {
    this._emptyContent();
    this._updateStyle();

    this._shadowRoot.appendChild(this._style);
    this._shadowRoot.innerHTML += `      
      <div>
          <h3>Buat Note Baru</h3>
          <form action="" id='noteForm'>
            <div class="form-element">
              <label for="title">Judul</label><br />
              <input type="text" name="title" id="title" />
              <p id="titleValidation" class="validation-message" aria-live="polite"></p>
            </div>
            <div class="form-element">
              <label for="body">Body</label><br />
              <textarea name="body" id="body" cols="30" rows="20"></textarea>
              <p id="bodyValidation" class="validation-message" aria-live="polite"></p>
            </div>
            <div class="form-element">
              <input type="submit" name="" id="buttonSubmit" value="SIMPAN" />
            </div>
          </form>
        </div>
    `;
  }

  _handleSubmit(event) {
    event.preventDefault();
    const title = this._shadowRoot.querySelector("#title").value;
    const body = this._shadowRoot.querySelector("#body").value;

    if (!title.trim() && !body.trim()) {
      this._errorDialog("Judul dan Body Wajib diisi!");
      this._showTitleValidationError("Wajib diisi.");
      this._showBodyValidationError("Wajib diisi.");
      return;
    } else {
      this._hideTitleValidationError();
      this._hideBodyValidationError();
    }

    this._addNewNote(title, body);
    this._addNewNoteDummy(title, body);
    this._newNoteDialog();

    event.target.reset();
  }

  async _addNewNote(title, body) {
    try {
      const newNote = await NotesApi.createNote(title, body);
      console.log("Catatan baru ditambahkan: ", newNote);

      const event = new CustomEvent("noteCreated", {
        detail: { newNote },
      });
      document.dispatchEvent(event);

      const updatedNotes = await NotesApi.fetchNotes();

      const eventUpdate = new CustomEvent("notesDataChanged", {
        detail: { newNotesData: updatedNotes },
      });
      document.dispatchEvent(eventUpdate);
    } catch (error) {
      console.error(error);
    }
  }

  _addNewNoteDummy(title, body) {
    const newNote = {
      id: `note-${Date.now()}`,
      title,
      body,
      createdAt: new Date().toISOString(),
      archived: false,
    };
    notesData.unshift(newNote);
    console.log("Catatan baru ditambahkan: ", newNote);

    const event = new CustomEvent("notesDataDummyChanged", {
      detail: { newNotesDataDummy: notesData },
    });
    document.dispatchEvent(event);
  }

  _handleTitleInput(event) {
    const title = event.target.value;
    if (!title.trim()) {
      this._showTitleValidationError("Wajib diisi.");
    } else {
      this._hideTitleValidationError();
    }
  }

  _handleBodyInput(event) {
    const body = event.target.value;
    if (!body.trim()) {
      this._showBodyValidationError("Wajib diisi.");
    } else {
      this._hideBodyValidationError();
    }
  }

  _handleTitleBlur(event) {
    const title = event.target.value;
    if (!title.trim()) {
      this._showTitleValidationError("Wajib diisi.");
    }
  }

  _handleBodyBlur(event) {
    const body = event.target.value;
    if (!body.trim()) {
      this._showBodyValidationError("Wajib diisi.");
    }
  }

  _showTitleValidationError(message) {
    const titleValidation = this._shadowRoot.querySelector("#titleValidation");
    titleValidation.textContent = message;
  }

  _hideTitleValidationError() {
    const titleValidation = this._shadowRoot.querySelector("#titleValidation");
    titleValidation.textContent = "";
  }

  _showBodyValidationError(message) {
    const bodyValidation = this._shadowRoot.querySelector("#bodyValidation");
    bodyValidation.textContent = message;
  }

  _hideBodyValidationError() {
    const bodyValidation = this._shadowRoot.querySelector("#bodyValidation");
    bodyValidation.textContent = "";
  }

  _errorDialog(message) {
    Swal.fire({
      title: "Error!",
      text: message,
      icon: "error",
      confirmButtonColor: "#102c57",
    });
  }

  _newNoteDialog() {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: "success",
      title: "Catatan baru berhasil ditambahkan",
    });
  }
}

customElements.define("note-form", NoteForm);
