import * as Http from "http";
import Chance from "chance";

const chance = new Chance();
const log = console.log;

Http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  while (chance.bool({ liklihood: 95 })) {
    res.write(chance.string() + "\n");
  }
  res.end("\nThe end...\n");
  res.on("finish", () => log("All data was sent"));
}).listen(8080, () => log("Listening on http://localhost:8080"));
