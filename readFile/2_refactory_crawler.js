import * as FS from "fs";
import * as Path from "path";

import Request from "request";
import Mkdirp from "mkdirp";

import * as Utils from "./utils";

function crawl(url, callback) {
  const filename = Utils.urlToFilename(url);
  FS.stat(filename, (err, stats) => {
    if (err === null) {
      return callback(null, filename, false);
    }

    download(url, filename, err => {
      if (err) {
        return callback(err);
      }

      callback(null, filename, true);
    });
  });
}

function download(url, filename, callback) {
  console.log(`Downloading ${url}`);
  Request(url, (err, response, body) => {
    if (err) {
      return callback(err);
    }

    saveFile(filename, body, err => {
      if (err) {
        return callback(err);
      }

      console.log(`Downloaded and saved: ${url}`);
      callback(null, body);
    });
  });
}

function saveFile(filename, contents, callback) {
  Mkdirp(Path.dirname(filename), err => {
    if (err) {
      return callback(err);
    }

    FS.writeFile(filename, contents, callback);
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
