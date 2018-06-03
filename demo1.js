const http = require("http")

const serve = http.createServer((request, response) => {
  console.log(request.url)
})

serve.listen(8080, err => {
  if (err) {
    console.log("err")
  } else {
    console.log("ready")
  }
})
