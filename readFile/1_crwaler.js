import * as FS from "fs";
import * as Path from "path";

import Request from "request";
import Mkdirp from "mkdirp";

import * as Utils from "./utils";

function crawl(url, callback) {
  const filename = Utils.urlToFilename(url);
  // fs.stat documentation (https://nodejs.org/api/fs.html#fs_fs_stat_path_callback)
  FS.stat(filename, (err, stats) => {
    if (err === null) {
      return callback(null, filename, false);
    }

    console.log(`Downloading ${url}`);
    // request (https://github.com/request/request)
    Request(url, (err, response, body) => {
      // mkdirp (https://github.com/substack/node-mkdirp)
      Mkdirp(Path.dirname(filename), err => {
        if (err) {
          return callback(err);
        }

        FS.writeFile(filename, body, err => {
          if (err) {
            return callback(err);
          }

          callback(null, filename, true);
        });
      });
    });
  });
}

crawl(process.argv[2], (err, filename, downloaded) => {
  if (err) {
    console.log(err);
  } else if (downloaded) {
    console.log(`Completed the download of "${filename}"`);
  } else {
    console.log(`"${filename}" was already downloaded`);
  }
});
