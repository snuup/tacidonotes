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
      this.loadnotes();
    }
    $(window).unload(() => this.close());

    // view
    this.template = $("#notetemplate").children().get(0);
    $("#notes")
      .on("click", ".invite", (e) => this.onInviteClick(e))
      .on("click", ".btndelete", (e) => this.onDeleteClick(e))
      .on("click", ".btncancel", (e) => this.onCancelClick(e))
      .on("click", ".btnedit", (e) => this.onEditClick(e))
      .on("click", ".btnsave", (e) => this.onSaveClick(e));
    $("#btnsetpw").click(() => this.setPassword());
    $("#btncollapsepwpanel").click(() => this.btnCollapsePwPanel());
  }

  close() { 
    console.log("unload");
    this.nm.close();
  }

  loadnotes() {
    this.nm.connect((files: FileInfo[]) => this.notes2view(files));
  }

  notes2view(files: FileInfo[]) {
    
    // latest notes on top
    files.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());

    var $notes = $("#notes");
    $notes.html("");
    this.addInvite();
    var i = 0;
    files.forEach(fi => {
      var dom = this.createnoteview(fi);
      $(dom).data("fi", fi);
      $notes.append(dom);
      if (i++ < 5) this.note2view(fi.path, dom); // load the first 5 notes
    })
  }

  note2view(filepath: string, noteview: HTMLElement) {        
    this.nm.read(filepath, (n: Note) => {
      $(".name", noteview).html(n.name);
      $(".content", noteview).html(n.content);
    });
  }

  getpath(fi: FileInfo) {
    return "notes/" + fi.name;
  }

  createnoteview(fi: FileInfo): HTMLElement {
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

  addInvite() {
    var nv: HTMLElement = this.createnoteview(null);
    $(nv).addClass("invite");
    $("#notes").prepend(nv);
  }

  onInviteClick(e) {
    var $noteview = $(e.target).closest(".note");
    $noteview.removeClass("invite");
    this.switchedit($noteview.get(0), true);
    return false;
  }

  onSaveClick(e) {
    var $dom = $(e.target).closest(".note");
    this.save($dom.get(0));    
    this.ensureinvite();
  }

  ensureinvite() {
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
      this.switchedit(dom, false);
    });
  }

  onDeleteClick(e) {
    var $dom = $(e.target).closest(".note");
    var fi: FileInfo = $dom.data("fi");
    this.nm.deleteNote(fi.path, () => { $dom.remove(); });
  }

  onCancelClick(e) {
    var $dom = $(e.target).closest(".note");
    this.switchedit($dom.get(0), false);
    var fi = $dom.data("fi");
    if (fi) {
      this.note2view(fi.path, $dom.get(0));
    } else {
      $dom.find(".name,.content").html("");
    }
  }

  onEditClick(e) {
    var $dom = $(e.target).closest(".note");
    this.switchedit($dom.get(0), true);
  }

  switchedit(notedom: HTMLElement, edit: bool) {
    $(notedom).toggleClass("editing", edit);
    $(".name", notedom).attr("contenteditable", edit).focus();
    $(".content", notedom).attr("contenteditable", edit);
    if (!edit && $(notedom).data("fi") == null) {
      $(notedom).addClass("invite");
    }
  }

  onwritecomplete(error, stat: FileInfo) {
    if (error) {
      console.log(error);  // Something went wrong.
    }
    else {
      console.log("File saved as revision " + stat.versionTag);
    }
  }

  debugPrintFiles(fileInfos: FileInfo[]) {
    fileInfos.forEach(fi => console.log(fi.name));
  }

  $noteElement(element) {
    return $(element).closest('li.note');
  }

  setPassword() {
    var pw = $("#pw").val();
    localStorage.setItem("pw", pw);
    this.nm.pw = pw;
    this.loadnotes();
  }

  btnCollapsePwPanel() {
    $("#pwpanel").toggleClass("hidden");
  }
}

var app = new Application();
app.run();
