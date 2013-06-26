/// <reference path="file.ts" />

declare var sjcl: any;

class Note {
  name: string;
  content: string;

  constructor(name: string, content: string) {
    this.name = name;
    this.content = content;
  }
}

class NoteManager {
  
  pw: string;
  private fm: FileManager;

  constructor() {
    this.fm = new FileManager();    
  }

  connect(success: (files: FileInfo[]) => void ) // returns all notes in the store, descending ordered by modification time
  {
    this.fm.connect(() => this.fm.readNotesDirectory(success));
  }

  close() {
    this.fm.close();
  }

  /* if filename is null, it will be created */
  save(filepath: string, name: string, content: string, oncomplete: (fi: FileInfo) => void ) {
    if (!filepath) {
      // the note is fresh, so we create a new filename
      var d = new Date();
      var s = d.toISOString().replace(/[-T:.Z]/g, "_");
      var filename = s + ".htm";
      filepath = "notes/" + filename;
    }

    var n = new Note(name, content);
    var encrypted = this.encrypt(n);
    this.fm.writeFile(filepath, encrypted, (error, fi) => {
      if (error) {
        console.log(error);
      } else {
        oncomplete(fi);
      }
    });
  }

  read(filepath: string, oncomplete: (n: Note) => void ) {
    this.fm.readFile(filepath, (error, filecontent) => {
      var n = this.decrypt(filecontent);
      if (error) {
        console.log(error);
      } else {
        oncomplete(n);
      }
    });
  }

  deleteNote(filepath: string, oncomplete: () => void ) {
    this.fm.deleteFile(filepath, oncomplete);
  }

  encrypt(n: Note): string {
    var json = JSON.stringify(n);
    var jsone = sjcl.encrypt(this.pw, json);
    return jsone;
  }

  decrypt(jsone: string): Note {
    var json = sjcl.decrypt(this.pw, jsone);
    var n = JSON.parse(json);
    return n;
  }
}
