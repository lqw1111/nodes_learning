import * as FS from "fs";
import * as Path from "path";

import Request from "request";
import Mkdirp from "mkdirp";

import * as Utils from "./utils";

function crawl(url, nesting, callback) {
  const filename = Utils.urlToFilename(url);
  FS.readFile(filename, "utf8", (err, body) => {
    if (err) {
      if (err.code !== "ENOENT") {
        return callback(err);
      }

      return download(url, filename, (err, body) => {
        if (err) {
          return callback(err);
        }
        crawlLinks(url, body, nesting, callback);
      });
    }

    crawlLinks(url, body, nesting, callback);
  });
}

function crawlLinks(url, body, nesting, callback) {
  if (nesting === 0 || !body) {
    // Official Docs about process.nextTick (https://nodejs.org/docs/latest/api/process.html#process_process_nexttick_callback_args)
    return process.nextTick(callback);
  }

  const links = Utils.getPageLinks(url, body);

  function iterate(index) {
    if (index === links.length) {
      return callback();
    }

    crawl(links[index], nesting - 1, err => {
      if (err) {
        return callback(err);
      }
      iterate(index + 1);
    });
  }
  iterate(0);
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

crawl(process.argv[2], 2, err => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Completed the download of "${process.argv[2]}"`);
  }
});
