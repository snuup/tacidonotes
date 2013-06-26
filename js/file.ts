// typescript defintions for the dropbox-js api

interface FileInfo {
  name: string;
  path: string;
  inAppFolder: bool;
  isFolder: bool;
  isFile: bool;
  isRemoved: bool;
  typeIcon: string;
  versionTag: string;
  mimeType: string;
  size: number;
  humanSize: string;
  hasThumbnail: bool;
  modifiedAt: Date;
  clientModifiedAt: Date;
}

interface IDropboxClient {

  // connect
  authDriver(f);
  authenticate(options?, callback?);
  signOut(callback?);

  // directory
  mkdir(path, callback);
  readdir(path, options, callback);

  // file
  writeFile(path: string, data: string, options, callback: (error, FileInfo) => void );
  readFile(path: string, options, callback: (error, data, stat: FileInfo, rangeInfo) => void );
  remove(path, callback);
}

declare var Dropbox: any;

class FileManager {

  private dbClient: IDropboxClient;

  connect(onconnected: () => void ) {
    this.dbClient = new Dropbox.Client(
      {
        key: "UGY2pGE9W9A=|ZvO6Lo3xD6r5+F9wTvCG1tHlYGuneNZEV/7pArfZNA==", // public key of TacidoNotes
        sandbox: true
      });
    this.dbClient.authDriver(new Dropbox.Drivers.Redirect({ rememberUser: true }))
    this.dbClient.authenticate((error, data) => { console.log(error) }, onconnected);
  }

  close() {
    this.dbClient.signOut();
  }

  readNotesDirectory(onresult: (r: FileInfo[]) => void , onerror?: (err: any) => void ) {
    this.dbClient.mkdir('/notes', (error, stat) => {
      this.dbClient.readdir('/notes', null, (error, entries, dir_stat, entry_stats) => {
        if (error) {
          if (onerror) onerror(error);
          return;
        }
        onresult(entry_stats);
      });
    });
  }

  readFile(filepath: string, oncomplete: (error, filecontent: string) => void ) {
    this.dbClient.readFile(filepath, null, (error, data, stat: FileInfo, rangeInfo) => oncomplete(error, data));
  }

  writeFile(filepath: string, content: string, oncomplete: (error, FileInfo) => void ) {
    this.dbClient.writeFile(filepath, content, null, (error, fi: FileInfo) => oncomplete(error, fi));
  }

  deleteFile(path: string, oncomplete: () => void ) {
    this.dbClient.remove(path, oncomplete);
  }
}
