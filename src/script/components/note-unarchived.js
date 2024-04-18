import NotesApi from "../data/remote/notes-api.js";
import "./loading.js";
import Swal from "sweetalert2";

class NotesList extends HTMLElement {
  _shadowRoot = null;
  _style = null;
  _notesData = null;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._style = document.createElement("style");
    this._notesData = [];

    document.addEventListener(
      "notesDataChanged",
      this._handleNotesDataChange.bind(this),
    );

    document.addEventListener(
      "noteUnarchived",
      this._handleNoteUnarchived.bind(this),
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
        margin-top: 20px;
        margin-bottom: 10px;
        }

        .delete-button {
          padding: 5px 10px;
          background-color: #f8f0e5;
          color: red;
          border: 1px solid red;
          border-radius: 5px;
          margin-bottom: 20px;
          cursor: pointer;
        }

        .delete-button:hover {
          background-color: red;
          color: #f8f0e5;
        }

        .archive-button {
          padding: 5px 10px;
          background-color: #f8f0e5;
          color: #102C57;
          border: 1px solid #102C57;
          border-radius: 5px;
          margin-bottom: 20px;
          cursor: pointer;
        }

        .archive-button:hover {
          background-color: #102C57;
          color: #f8f0e5;
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

  async connectedCallback() {
    try {
      this._notesData = await NotesApi.fetchNotes();
      this.render();

      document.addEventListener(
        "noteArchived",
        this._handleNoteArchived.bind(this),
      );
    } catch (error) {
      console.log(error);
    }
  }

  _renderNotes() {
    const notesContainer = document.createElement("div");
    notesContainer.className = "notes-container";

    this._notesData.forEach((note) => {
      const noteBox = document.createElement("div");
      noteBox.className = "note-box";
      noteBox.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.body}</p>
        <p id='createdAt'>${note.createdAt}</p>
        <button class="delete-button" data-note-id="${note.id}">Hapus Note</button>
        <button class="archive-button" archive-note-id="${note.id}">Arsipkan</button>
      `;
      noteBox.classList.add("fade-in");
      notesContainer.appendChild(noteBox);
    });

    const deleteButtons = notesContainer.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const noteId = button.getAttribute("data-note-id");
        Swal.fire({
          title: "Konfirmasi",
          text: "Anda yakin ingin menghapus Catatan?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#102C57",
          cancelButtonColor: "#d33",
          confirmButtonText: "Hapus",
          cancelButtonText: "Batal",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await NotesApi.deleteNote(noteId);

              this._notesData = this._notesData.filter(
                (note) => note.id !== noteId,
              );
              this.render();

              this._noteDeletedDialog();
            } catch (error) {
              console.error(error);

              Swal.fire({
                title: "Oops!",
                text: "Terjadi kesalahan saat menghapus catatan.",
                icon: "error",
              });
            }
          }
        });
      });
    });

    const archiveButtons = notesContainer.querySelectorAll(".archive-button");
    archiveButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const noteId = button.getAttribute("archive-note-id");
        try {
          await NotesApi.archiveNote(noteId);

          this._notesData = this._notesData.filter(
            (note) => note.id !== noteId,
          );

          const event = new CustomEvent("noteArchived", {
            detail: { noteId },
          });
          document.dispatchEvent(event);

          this.render();
        } catch (error) {
          console.error(error);
        }
      });
    });

    return notesContainer;
  }

  render() {
    this._showLoading();

    setTimeout(() => {
      this._emptyContent();
      this._updateStyle();
      this._shadowRoot.appendChild(this._style);
      this._shadowRoot.appendChild(this._renderNotes());

      this._hideLoading();
    }, 1500);
  }

  _handleNotesDataChange(event) {
    this._notesData = event.detail.newNotesData;
    this.render();
  }

  async _handleNoteUnarchived() {
    try {
      const updatedNotes = await NotesApi.fetchNotes();
      this._notesData = updatedNotes;
      this.render();
    } catch (error) {
      console.error(error);
    }
  }

  _noteDeletedDialog() {
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
      title: "Catatan berhasil dihapus",
    });
  }

  _showLoading() {
    const loadingElement = document.createElement("my-loading");
    this._shadowRoot.appendChild(loadingElement);
  }

  _hideLoading() {
    const loadingElement = this._shadowRoot.querySelector("my-loading");
    if (loadingElement) {
      this._shadowRoot.removeChild(loadingElement);
    }
  }
}

customElements.define("notes-unarchived", NotesList);
