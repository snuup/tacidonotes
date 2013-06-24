var FileManager = (function () {
    function FileManager() {
    }
    FileManager.prototype.connect = function (onconnected) {
        this.dbClient = new Dropbox.Client({
            key: "UGY2pGE9W9A=|ZvO6Lo3xD6r5+F9wTvCG1tHlYGuneNZEV/7pArfZNA==",
            sandbox: true
        });
        this.dbClient.authDriver(new Dropbox.Drivers.Redirect({ rememberUser: true }));
        this.dbClient.authenticate(function (error, data) {
            console.log(error);
        }, onconnected);
    };

    FileManager.prototype.close = function () {
        this.dbClient.signOut();
    };

    FileManager.prototype.readNotesDirectory = function (onresult, onerror) {
        var _this = this;
        this.dbClient.mkdir('/notes', function (error, stat) {
            _this.dbClient.readdir('/notes', null, function (error, entries, dir_stat, entry_stats) {
                if (error) {
                    if (onerror)
                        onerror(error);
                    return;
                }
                onresult(entry_stats);
            });
        });
    };

    FileManager.prototype.readFile = function (filepath, oncomplete) {
        this.dbClient.readFile(filepath, null, function (error, data, stat, rangeInfo) {
            return oncomplete(data);
        });
        this.dbClient.readFile(filepath, null, function (error, data, stat, rangeInfo) {
            return oncomplete(data);
        });
    };

    FileManager.prototype.writeFile = function (filepath, content, oncomplete) {
        this.dbClient.writeFile(filepath, content, null, function (error, fi) {
            return oncomplete(error, fi);
        });
    };

    FileManager.prototype.deleteFile = function (path, oncomplete) {
        this.dbClient.remove(path, oncomplete);
    };
    return FileManager;
})();
//@ sourceMappingURL=file.js.map
