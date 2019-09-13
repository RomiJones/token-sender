let express = require('express')
let path = require('path')
let logger = require('morgan')
let fileStreamRotator = require('file-stream-rotator')
let fs = require('fs')
let cors = require('cors')
let apiBaseUri = require('../api/apiNamespace').API_BASE_URI

let router = require('../router/routers')
let app = express()

let logDirectory = path.join(__dirname, '../log/local')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory, {recursive:true});

// create a rotating write stream
let accessLogStream = fileStreamRotator.getStream({
  date_format: 'YYYY-MM-DD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
})

app.use(logger('combined', {stream: accessLogStream}))

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cors())

let allRouters = [
  require('../api/ethAPI/sendErc20'),
  require('../api/dbAPI/txNotify'),
]

router.RouterRegister(app, allRouters)

app.use(function(req, res) {
  res.status(404)
    .json({Error: "404 - page not found"})
});

app.use((err, req, res, next) => {
  res.status(500)
  res.json({Error: err})
})

module.exports = app
