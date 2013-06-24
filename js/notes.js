var Note = (function () {
    function Note(name, content) {
        this.name = name;
        this.content = content;
    }
    return Note;
})();

var NoteManager = (function () {
    function NoteManager(fm) {
        this.fm = fm;
    }
    NoteManager.prototype.connect = function (success) {
        var _this = this;
        this.fm.connect(function () {
            return _this.fm.readNotesDirectory(success);
        });
    };

    NoteManager.prototype.close = function () {
        this.fm.close();
    };

    /* if filename is null, it will be created */
    NoteManager.prototype.save = function (filepath, name, content, oncomplete) {
        if (!filepath) {
            // the note is fresh, so we create a new filename
            var d = new Date();
            var filename = d.getTime() + ".htm";
            filepath = "notes/" + filename;
        }

        var n = new Note(name, content);
        var encrypted = this.encrypt(n);
        this.fm.writeFile(filepath, encrypted, function (error, fi) {
            if (error) {
                console.log(error);
            } else {
                oncomplete(fi);
            }
        });
    };

    NoteManager.prototype.read = function (filepath, oncomplete) {
        var _this = this;
        this.fm.readFile(filepath, function (filecontent) {
            var n = _this.decrypt(filecontent);
            oncomplete(n);
        });
    };

    NoteManager.prototype.deleteNote = function (filepath, oncomplete) {
        this.fm.deleteFile(filepath, oncomplete);
    };

    NoteManager.prototype.encrypt = function (n) {
        var json = JSON.stringify(n);
        var jsone = sjcl.encrypt(this.pw, json);
        return jsone;
    };

    NoteManager.prototype.decrypt = function (jsone) {
        var json = sjcl.decrypt(this.pw, jsone);
        var n = JSON.parse(json);
        return n;
    };
    return NoteManager;
})();
//@ sourceMappingURL=notes.js.map
