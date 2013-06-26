var Application = (function () {
    function Application() {
    }
    Application.prototype.run = function () {
        var _this = this;
        // model
        this.nm = new NoteManager();

        var pw = localStorage.getItem("pw");
        if (!pw)
            alert("password must be set!");
        $("#pwpanel").toggleClass("hidden", pw != null);
        if (pw) {
            this.nm.pw = pw;
            this.loadNotes();
        }
        $(window).unload(function () {
            return _this.close();
        });

        // view
        this.template = $("#notetemplate").children().get(0);
        $("#notes").on("click", ".invite", function (e) {
            return _this.newNote(e);
        }).on("click", ".btndelete", function (e) {
            return _this.deleteNote(e);
        }).on("click", ".btncancel", function (e) {
            return _this.cancelEdit(e);
        }).on("click", ".btnedit", function (e) {
            return _this.editNote(e);
        }).on("click", ".btnsave", function (e) {
            return _this.onSaveClick(e);
        }).on("click", ".note", function (e) {
            return _this.loadUnloadedNote(e);
        });
        $("#btnsetpw").click(function () {
            return _this.setPassword();
        });
        $("#btncollapsepwpanel").click(function () {
            return _this.collapsePwPanel();
        });
    };

    Application.prototype.close = function () {
        this.nm.close();
    };

    Application.prototype.loadNotes = function () {
        var _this = this;
        this.nm.connect(function (files) {
            // latest notes on top
            files.sort(function (a, b) {
                return b.modifiedAt.getTime() - a.modifiedAt.getTime();
            });

            var $notes = $("#notes");
            $notes.html("");
            _this.addInvite();
            var i = 0;
            files.forEach(function (fi) {
                var dom = _this.createNoteView(fi);
                $notes.append(dom);
                if (i++ < 5)
                    _this.loadNote(fi.path, dom);
            });
        });
    };

    Application.prototype.loadNote = function (filepath, noteview) {
        this.nm.read(filepath, function (n) {
            $(".name", noteview).html(n.name);
            $(".content", noteview).html(n.content);
        });
    };

    Application.prototype.createNoteView = function (fi) {
        var dom = this.template.cloneNode(true);
        var name = "";
        if (fi) {
            name = fi.name;
            var t = moment(fi.modifiedAt).fromNow();
            $(dom).data("fi", fi);
        }
        $(".name", dom).text(name);
        $(".content", dom).text("");
        $(".time", dom).text(t);
        return dom;
    };

    Application.prototype.loadUnloadedNote = function (e) {
        var $noteview = $(e.target).closest(".note");
        var fi = $noteview.data("fi");
        if (fi && $(".content", $noteview).text() == "") {
            this.loadNote(fi.path, $noteview.get(0));
        }
    };

    Application.prototype.addInvite = function () {
        var nv = this.createNoteView(null);
        $(nv).addClass("invite");
        $("#notes").prepend(nv);
    };

    Application.prototype.newNote = function (e) {
        var $noteview = $(e.target).closest(".note");
        $noteview.removeClass("invite");
        this.switchEdit($noteview.get(0), true);
        return false;
    };

    Application.prototype.onSaveClick = function (e) {
        var $dom = $(e.target).closest(".note");
        this.save($dom.get(0));
        this.ensureInvite();
    };

    Application.prototype.ensureInvite = function () {
        if ($("#notes > .note.invite :first").length == 0) {
            this.addInvite();
        }
    };

    Application.prototype.save = function (dom) {
        var _this = this;
        var fi = $(dom).data("fi");
        var content = $(".content", dom).html();
        var name = $(".name", dom).html();
        this.nm.save(fi ? fi.path : null, name, content, function (fi) {
            $(dom).data("fi", fi);
            _this.switchEdit(dom, false);
        });
    };

    Application.prototype.deleteNote = function (e) {
        var $dom = $(e.target).closest(".note");
        var fi = $dom.data("fi");
        this.nm.deleteNote(fi.path, function () {
            $dom.remove();
        });
    };

    Application.prototype.cancelEdit = function (e) {
        var $dom = $(e.target).closest(".note");
        this.switchEdit($dom.get(0), false);
        var fi = $dom.data("fi");
        if (fi) {
            this.loadNote(fi.path, $dom.get(0));
        } else {
            $dom.find(".name,.content").html("");
        }
    };

    Application.prototype.editNote = function (e) {
        var $dom = $(e.target).closest(".note");
        this.switchEdit($dom.get(0), true);
    };

    Application.prototype.switchEdit = function (notedom, edit) {
        $(notedom).toggleClass("editing", edit);
        $(".name", notedom).attr("contenteditable", edit).focus();
        $(".content", notedom).attr("contenteditable", edit);
        if (!edit && $(notedom).data("fi") == null) {
            $(notedom).addClass("invite");
        }
    };

    Application.prototype.setPassword = function () {
        var pw = $("#pw").val();
        localStorage.setItem("pw", pw);
        this.nm.pw = pw;
        this.loadNotes();
    };

    Application.prototype.collapsePwPanel = function () {
        $("#pwpanel").toggleClass("hidden");
    };
    return Application;
})();

var app = new Application();
app.run();
//@ sourceMappingURL=app.js.map
