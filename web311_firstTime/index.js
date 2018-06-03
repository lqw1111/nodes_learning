import * as Readline from "readline"
import * as FS from "fs"
import AsciiImage from "image-to-ascii"
import * as Axios from "axios"

// const rl = Readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// })

// rl.question("What do you think of Node.js", answer => {
//   console.log("Thank you for you valuable feedback:", answer)
//   rl.close()
// })

// rl.question("what do you want to save into local file system?", message => {
//   FS.appendFile("database.txt", message, err => {
//     if (err) throw err
//     console.log("Your message has been saved")
//     rl.close()
//   })
// })
//
// rl.question("Do you want to see data base", () => {
//   FS.appendFile("database.txt", "utf8", (err, data) => {
//     if (err) throw err
//     console.log(data)
//     rl.close()
//   })
// })

// rl.question("Please provide the image url:", url => {
//   AsciiImage(url, (err, converted) => {
//     console.log(err || converted)
//     rl.close()
//   })
// })

// rl.question("What is the sum", input => {
//   let sum = 0
//   input.split(",").map(num => (sum = sum + parseInt(num)))
//   console.log(sum)
//   rl.close()
// })
const cur = new Date()
console.log(cur)
Axios.get("https://jsonplaceholder.typicode.com/posts/1").then(res => {
  console.log(res.data)
  console.log(new Date() - cur)
})
FS.readFile("database.txt", "utf8", (err, data) => {
  if (err) throw err
  console.log(new Date() - cur)
})
