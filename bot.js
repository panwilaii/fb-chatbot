import express from 'express'
import bodyParser from 'body-parser'
import request from 'request'

const config = {
  VERIFY_TOKEN: process.env.VERIFY_TOKEN || 'beansauce',
  PAGE_TOKEN: process.env.PAGE_TOKEN || 'beansauce',
}

const app = express()
const port = (process.env.PORT || 5678)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === config.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  } else {
    res.send('Error, wrong validation token')
  }
})

app.post('/webhook', (req, res) => {
  console.log(req.body)

  req.body.entry.forEach((entry) => {
    const pageID = entry.id
    const time = entry.time

    entry.messaging.forEach((event) => {
      if (event.message) {
        sendTextMessage({
          id: event.sender.id,
          text: event.message.text,
        })
      } else {
        console.log('unknown event!!!', event)
      }
    })
  })

  res.sendStatus(200)
})

app.listen(port, () => console.log(`listening on port ${port}`))

function sendTextMessage({id, text}) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: config.PAGE_TOKEN,
    },
    method: 'POST',
    json: {
      recipient: {
        id,
      },
      message: {
        text,
      }
    }
  }, (error, response, body) => {
    console.log('Error: ', error || response.body.error)
  })
}