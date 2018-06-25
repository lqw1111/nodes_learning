import * as Stream from "stream";
import Chance from "chance";

const chance = new Chance();
const log = console.log;

const randomStream = new Stream.Readable({
  read(size) {
    const chunk = chance.string();
    log(`Pushing chunk of size: ${chunk.length}`);
    this.push(chunk, "utf8");
    if (chance.bool({ likelihood: 5 })) {
      this.push(null);
    }
  }
});

randomStream.on("readable", () => {
  let chunk;
  while ((chunk = randomStream.read()) !== null) {
    log(`Chunk received: ${chunk.toString()}`);
  }
});
