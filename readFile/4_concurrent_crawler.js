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
    return process.nextTick(callback);
  }
  const links = Utils.getPageLinks(url, body);
  if (links.length === 0) {
    return process.nextTick(callback);
  }

  let completed = 0,
    hasErrors = false;

  function done(err) {
    if (err) {
      hasErrors = true;
      return callback(err);
    }

    completed += 1;
    if (completed === links.length && !hasErrors) {
      return callback();
    }
  }

  links.forEach(link => {
    crawl(link, nesting - 1, done);
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

crawl(process.argv[2], 2, err => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Completed the download of "${process.argv[2]}"`);
  }
});
