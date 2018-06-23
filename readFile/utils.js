import * as Url from "url";
import * as Path from "path";
import Slug from "slug";
import * as Cheerio from "cheerio";

function urlToFilename(url) {
  const parsedUrl = Url.parse(url);
  const urlPath = parsedUrl.path
    .split("/")
    .filter(component => component !== "")
    .map(component => Slug(component, { remove: null }))
    .join("/");

  let filename = Path.join(parsedUrl.hostname, urlPath);
  if (!Path.extname(filename).match(/htm/)) {
    filename += ".html";
  }
  return filename;
}

function getLinkUrl(currentUrl, element) {
  const link = Url.resolve(currentUrl, element.attribs.href || "");
  const parsedLink = Url.parse(link);
  const currentParsedUrl = Url.parse(currentUrl);
  if (
    parsedLink.hostname !== currentParsedUrl.hostname ||
    !parsedLink.pathname
  ) {
    return null;
  }
  return link;
}

function getPageLinks(currentUrl, body) {
  return [].slice
    .call(Cheerio.load(body)("a"))
    .map(element => getLinkUrl(currentUrl, element))
    .filter(element => !!element);
}

export { urlToFilename, getPageLinks };
