const http            = require('http')
const webSocketServer = require('websocket').server
const clientList      = require('./src/consts/clientList')
const history         = require('./src/consts/history')
const messageHandler  = require('./src/handlers/messageHandler')
const closeHandler    = require('./src/handlers/closeHandler')

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat'

// Port where we'll run the websocket server
const webSocketsServerPort = 1337

/**
 * HTTP server
 */
const server = http.createServer((request, response) => {
  // Not important for us. We're writing WebSocket server,
  // not HTTP server
})

server.listen(webSocketsServerPort, () => {
  console.log(`${new Date()} Server is listening on port ${webSocketsServerPort}`)
})

/**
 * WebSocket server
 */
const wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket
  // request is just an enhanced HTTP request. For more info
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server,
})

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on(
  'request',
  request => {
    const user = {name: false}

    console.log(`${new Date()} Connection from origin ${request.origin}.`)

    // accept connection - you should check 'request.origin' to
    // make sure that client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    const connection = request.accept(null, request.origin)

    // we need to know client index to remove them on 'close' event
    const index = clientList.push(connection) - 1

    console.log(`${new Date()} Connection accepted.`)

    // send back chat history
    if (history.length > 0) {
      connection.sendUTF(
        JSON.stringify({
          type: 'history',
          data: history,
        }),
      )
    }

    // user sent some message
    connection.on('message', messageHandler(user))

    // user disconnected
    connection.on('close', closeHandler({connection, index}))
  },
)
