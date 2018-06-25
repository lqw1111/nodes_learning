import * as fs from "fs";
import * as path from "path";

import request from "request";
import mkdirp from "mkdirp";

import * as utils from "./utils";

import * as async from "async";

function crawl(url, nesting, callback) {
  const filename = utils.urlToFilename(url);

  fs.readFile(filename, "utf-8", (err, body) => {
    if (err) {
      if (err.code !== "ENOENT") return callback(err);

      return downloadFile(url, filename, (err, content) => {
        if (err) return callback(err);

        crawlLinks(url, content, nesting, callback);
        // crawlLinks(url,body,nesting,callback);
      });
    }
    crawlLinks(url, body, nesting, callback);
  });
}

function crawlLinks(url, body, nesting, callback) {
  if (nesting === 0 || !body) {
    return process.nextTick(callback);
  }

  const links = utils.getPageLinks(url, body);

  if (links.length === 0) {
    return process.nextTick(callback);
  }

  const crawlAmount = 4;
  let completed = crawlAmount;

  let queue = async.queue((link, callback) => {
    crawl(link, nesting - 1, callback);
  }, crawlAmount);

  queue.drain = err => {
    if (err) return callback(err);

    callback();
  };

  for (let i = 0; i < completed; i++) {
    queue.push(links[i], pushtoQueue);
  }

  function pushtoQueue() {
    if (completed < links.length) {
      queue.push(links[completed], pushtoQueue);
      completed++;
    }
  }
}

function downloadFile(url, filename, callback) {
  console.log(`donloading ${url}`);
  request(url, (err, response, body) => {
    if (err) return callback(err);

    saveFile(filename, body, err => {
      if (err) return callback(err);

      console.log(`Downloaded and saved: ${url}`);

      callback(null, body);
    });
  });
}

function saveFile(filename, body, callback) {
  mkdirp(path.dirname(filename), err => {
    if (err) return callback(err);

    fs.writeFile(filename, body, callback);
  });
}

crawl(process.argv[2], 1, (err, filename, downloaded) => {
  if (err) {
    console.log(err);
  } else if (downloaded) {
    console.log(`Completed the download of "${prcoess.argv[2]}"`);
  } else {
    console.log(`"${filename}" was already downloaded`);
  }
});
