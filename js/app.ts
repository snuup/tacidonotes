/// <reference path="../lib/jquery.d.ts" />
/// <reference path="file.ts" />
/// <reference path="notes.ts" />

declare var moment: any;

class Application {

  // model  
  nm: NoteManager;

  // view
  template: Element;

  run() {
    
    // model
    var fm = new FileManager();
    this.nm = new NoteManager(fm);

    var pw: string = localStorage.getItem("pw");
    if (!pw) alert("password must be set!");
    $("#pwpanel").toggleClass("hidden", pw != null);
    if (pw)
    {
      this.nm.pw = pw;
      this.loadNotes();
    }
    $(window).unload(() => this.close());

    // view
    this.template = $("#notetemplate").children().get(0);
    $("#notes")
      .on("click", ".invite", (e) => this.newNote(e))
      .on("click", ".btndelete", (e) => this.deleteNote(e))
      .on("click", ".btncancel", (e) => this.cancelEdit(e))
      .on("click", ".btnedit", (e) => this.editNote(e))
      .on("click", ".btnsave", (e) => this.onSaveClick(e))
      .on("click", ".note", (e) => this.loadUnloadedNote(e));
    $("#btnsetpw").click(() => this.setPassword());
    $("#btncollapsepwpanel").click(() => this.collapsePwPanel());
  }

  close() { 
    console.log("unload");
    this.nm.close();
  }

  loadNotes() {
    this.nm.connect((files: FileInfo[]) => {
      // latest notes on top
      files.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());

      var $notes = $("#notes");
      $notes.html("");
      this.addInvite();
      var i = 0;
      files.forEach(fi => {
        var dom = this.createNoteView(fi);
        $(dom).data("fi", fi);
        $notes.append(dom);
        if (i++ < 2) this.loadNote(fi.path, dom); // load the first 5 notes
      })
    });
  }

  loadNote(filepath: string, noteview: HTMLElement) {
    this.nm.read(filepath, (n: Note) => {
      $(".name", noteview).html(n.name);
      $(".content", noteview).html(n.content);
    });
  }

  createNoteView(fi: FileInfo): HTMLElement {
    var name = "";
    if (fi) {
      name = fi.name;
      var t = moment(fi.modifiedAt).fromNow();
    }
    var dom = <HTMLElement>this.template.cloneNode(true);
    $(".name", dom).text(name);
    $(".content", dom).text("");
    $(".time", dom).text(t);
    return dom;
  }

  loadUnloadedNote(e) {
    var $noteview = $(e.target).closest(".note");
    var fi = <FileInfo>$noteview.data("fi");
    if (fi && $(".content", $noteview).text() == "") {
      console.log("load note");
      this.loadNote(fi.path, $noteview.get(0));
    }
  }

  addInvite() {
    var nv: HTMLElement = this.createNoteView(null);
    $(nv).addClass("invite");
    $("#notes").prepend(nv);
  }

  newNote(e) {
    var $noteview = $(e.target).closest(".note");
    $noteview.removeClass("invite");
    this.switchEdit($noteview.get(0), true);
    return false;
  }

  onSaveClick(e) {
    var $dom = $(e.target).closest(".note");
    this.save($dom.get(0));    
    this.ensureInvite();
  }

  ensureInvite() {
    if ($("#notes > .note.invite :first").length == 0) {
      this.addInvite();
    }    
  }

  save(dom) {    
    var fi: FileInfo = $(dom).data("fi");
    var content = $(".content", dom).html();
    var name = $(".name", dom).html();
    this.nm.save(fi ? fi.path : null, name, content, (fi) => {
      $(dom).data("fi", fi);
      this.switchEdit(dom, false);
    });
  }

  deleteNote(e) {
    var $dom = $(e.target).closest(".note");
    var fi: FileInfo = $dom.data("fi");
    this.nm.deleteNote(fi.path, () => { $dom.remove(); });
  }

  cancelEdit(e) {
    var $dom = $(e.target).closest(".note");
    this.switchEdit($dom.get(0), false);
    var fi = $dom.data("fi");
    if (fi) {
      this.loadNote(fi.path, $dom.get(0));
    } else {
      $dom.find(".name,.content").html("");
    }
  }

  editNote(e) {
    var $dom = $(e.target).closest(".note");
    this.switchEdit($dom.get(0), true);
  }

  switchEdit(notedom: HTMLElement, edit: bool) {
    $(notedom).toggleClass("editing", edit);
    $(".name", notedom).attr("contenteditable", edit).focus();
    $(".content", notedom).attr("contenteditable", edit);
    if (!edit && $(notedom).data("fi") == null) {
      $(notedom).addClass("invite");
    }
  }

  setPassword() {
    var pw = $("#pw").val();
    localStorage.setItem("pw", pw);
    this.nm.pw = pw;
    this.loadNotes();
  }

  collapsePwPanel() {
    $("#pwpanel").toggleClass("hidden");
  }
}

var app = new Application();
app.run();
