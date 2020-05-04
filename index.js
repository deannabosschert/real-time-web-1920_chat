const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const {
  MongoClient
} = require("mongodb")


require('dotenv').config()

const port = process.env.PORT
const url = process.env.MNG_URL
const dbName = process.env.DB_NAME

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function(req, res) {
  res.render('index', {})
})


io.on('connection', socket => {

  socket.on('user_join', data => {
    this.username = data
    socket.broadcast.emit('user_join', data)
  })

  socket.on('chat_message', data => {
    data.username = this.username
    socket.broadcast.emit('chat_message', data)
    const message = data.message
    checkMessage(message)
  })

  socket.on('chat_quote', function(quote) {
    socket.broadcast.emit('chat_quote', quote)
  })

  socket.on('disconnect', data => {
    socket.broadcast.emit('user_leave', this.username)
  })

  function checkMessage(message) {
    const addquote = "/addquote" || ".addquote"
    const quote = "/quote" || ".quote"
    if (message.includes(addquote)) {
      addQuote(message)
    } else if (message.includes(quote)) {
      getQuote()
    } else {}
  }

  async function addQuote(message) {
    const cleanQuote = message.substring(10).trim()
    const quote = {
      "quote": cleanQuote
    }
    const client = await MongoClient.connect(url, options)
    const db = client.db(dbName)
    console.log("Connected correctly to server")
    const item = await db.collection('chat_quote_list').insertOne(quote)
    client.close()
    io.emit("chat_quote", `Added "${cleanQuote}". I'm an amazing bot, right?`)
  }


  async function getQuote() {
    const client = await MongoClient.connect(url, options)
    const db = client.db(dbName)
    console.log("Connected correctly to server")
    const quote = await db.collection('chat_quote_list').aggregate([{
      $sample: {
        size: 1
      }
    }]).toArray()
    client.close()
    io.emit("chat_quote", quote[0].quote)
  }
})

http.listen(port, () => {
  console.log('App listening on: ' + port)
})