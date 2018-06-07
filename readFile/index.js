import * as FS from "fs"
var fsPromises = require("fs").promises

fsPromises.readdir("file").then((resolve, reject) => {
  console.log(resolve)
  var promises = []
  resolve.forEach(fileName => {
    promises.push(fsPromises.readFile(`file/${fileName}`, "utf8"))
  })

  Promise.all(promises)
    .then(
      results => {
        let sum = 0
        results.forEach(num => {
          sum += parseInt(num)
        })
        return sum
      },
      function(error) {
        console.log("Error reading files")
      },
    )
    .then(sum => {
      FS.writeFile("output.txt", sum, err => {
        if (err) throw err
      })
    })
})
