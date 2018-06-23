import * as FS from "fs";
import * as Path from "path";
import * as Util from "util";

import Request from "request";
import Mkdirp from "mkdirp";

import * as Utils from "./utils";

const request = Util.promisify(Request);
const mkdirp = Util.promisify(Mkdirp);
const readFile = Util.promisify(FS.readFile);
const writeFile = Util.promisify(FS.writeFile);

function crawlLinks(currentUrl, body, nesting) {
  if (nesting === 0) {
    return Promise.resolve();
  }

  const links = Utils.getPageLinks(currentUrl, body);
  const promises = links.map(link => crawl(link, nesting - 1));

  return Promise.all(promises);
}

function download(url, filename) {
  console.log(`Downloading ${url}`);
  let body;

  return request(url)
    .then(response => {
      body = response.body;
      return mkdirp(Path.dirname(filename));
    })
    .then(() => writeFile(filename, body))
    .then(() => {
      console.log(`Downloaded and saved: ${url}`);
      return body;
    });
}

const cache = new Map();
function crawl(url, nesting) {
  if (cache.has(url)) {
    return Promise.resolve();
  }
  cache.set(url, true);

  const filename = Utils.urlToFilename(url);
  return readFile(filename, "utf8").then(
    body => crawlLinks(url, body, nesting),
    err => {
      if (err.code !== "ENOENT") {
        throw err;
      }

      return download(url, filename).then(body =>
        crawlLinks(url, body, nesting)
      );
    }
  );
}

crawl(process.argv[2], 2)
  .then(() => console.log("Download complete"))
  .catch(err => console.log(err));
