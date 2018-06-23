import * as FS from "fs";
import * as Path from "path";
import * as Util from "util";

import Request from "request";
import Mkdirp from "mkdirp";
import Co from "co";

import * as Utils from "./utils";

const request = Util.promisify(Request);
const mkdirp = Util.promisify(Mkdirp);
const readFile = Util.promisify(FS.readFile);
const writeFile = Util.promisify(FS.writeFile);
const nextTick = Util.promisify(process.nextTick);

function* crawlLinks(currentUrl, body, nesting) {
  if (nesting === 0 || !body) {
    return nextTick();
  }

  const links = Utils.getPageLinks(currentUrl, body);
  for (const link of links) {
    yield crawl(link, nesting - 1);
  }
}

function* download(url, filename) {
  console.log(`Downloading ${url}`);
  const response = yield request(url);
  const body = response.body;
  yield mkdirp(Path.dirname(filename));
  yield writeFile(filename, body);
  console.log(`Downloaded and saved: ${url}`);
  return body;
}

function* crawl(url, nesting) {
  const filename = Utils.urlToFilename(url);
  let body;
  try {
    body = yield readFile(filename, "utf8");
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
    body = yield download(url, filename);
  }
  yield crawlLinks(url, body, nesting);
}

Co(function*() {
  try {
    yield crawl(process.argv[2], 1);
    console.log("Download complete");
  } catch (err) {
    console.log(err);
  }
});
