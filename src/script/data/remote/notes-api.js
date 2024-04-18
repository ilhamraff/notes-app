class NotesApi {
  static async fetchNotes() {
    try {
      const response = await fetch("https://notes-api.dicoding.dev/v2/notes");
      const data = await response.json();

      if (data.status === "success") {
        return data.data.filter((note) => !note.archived);
      } else {
        throw new Error("Failed to fetch notes");
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async createNote(title, body) {
    try {
      const response = await fetch("https://notes-api.dicoding.dev/v2/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      });

      const data = await response.json();

      if (response.ok) {
        return data.data;
      } else {
        throw new Error(data.message || "Failed to create note");
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async deleteNote(noteId) {
    try {
      const response = await fetch(
        `https://notes-api.dicoding.dev/v2/notes/${noteId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
      } else {
        console.error("Failed to Delete Note", data.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  static async fetchNotesArchived() {
    try {
      const response = await fetch(
        "https://notes-api.dicoding.dev/v2/notes/archived",
      );
      const data = await response.json();

      if (data.status === "success") {
        return data.data;
      } else {
        throw new Error("Failed to fetch archived notes");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async archiveNote(noteId) {
    try {
      const response = await fetch(
        `https://notes-api.dicoding.dev/v2/notes/${noteId}/archive`,
        {
          method: "POST",
        },
      );
      const data = await response.json();

      if (data.status === "success") {
        return data.message;
      } else {
        throw new Error("Failed to archive note");
      }
    } catch (error) {}
  }

  static async unarchiveNote(noteId) {
    try {
      const response = await fetch(
        `https://notes-api.dicoding.dev/v2/notes/${noteId}/unarchive`,
        {
          method: "POST",
        },
      );
      const data = await response.json();

      if (data.status === "success") {
        return data.message;
      } else {
        throw new Error("Failed to unarchive note");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default NotesApi;
