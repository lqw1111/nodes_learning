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

async function crawlLinks(currentUrl, body, nesting) {
  if (nesting === 0 || !body) {
    return nextTick();
  }

  const links = Utils.getPageLinks(currentUrl, body);
  for (const link of links) {
    await crawl(link, nesting - 1);
  }
}

async function download(url, filename) {
  console.log(`Downloading ${url}`);
  const response = await request(url);
  const body = response.body;
  await mkdirp(Path.dirname(filename));
  await writeFile(filename, body);
  console.log(`Downloaded and saved: ${url}`);
  return body;
}

async function crawl(url, nesting) {
  const filename = Utils.urlToFilename(url);
  let body;
  try {
    body = await readFile(filename, "utf8");
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
    body = await download(url, filename);
  }
  await crawlLinks(url, body, nesting);
}

async function main() {
  try {
    await crawl(process.argv[2], 1);
    console.log("Download complete");
  } catch (err) {
    console.log(err);
  }
}
main();
