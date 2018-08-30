// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat'

// Port where we'll run the websocket server
const webSocketsServerPort = 1337

// websocket and http servers
const webSocketServer = require('websocket').server
const http            = require('http')

/**
 * Global variables
 */
// All messages
const history = []
// list of currently connected clients (users)
const clients = []

/**
 * Helper function for escaping input strings
 */
function htmlEntities (str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

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
wsServer.on('request', request => {
  console.log(`${new Date()} Connection from origin ${request.origin}.`)

  // accept connection - you should check 'request.origin' to
  // make sure that client is connecting from your website
  // (http://en.wikipedia.org/wiki/Same_origin_policy)
  const connection = request.accept(null, request.origin)
  // we need to know client index to remove them on 'close' event
  const index    = clients.push(connection) - 1
  let userName   = false

  console.log(`${new Date()} Connection accepted.`)

  // send back chat history
  if (history.length > 0) {
    connection.sendUTF(
      JSON.stringify({
        type: 'history',
        data: history,
      })
    )
  }

  // user sent some message
  connection.on('message', message => {
    if (message.type === 'utf8') { // accept only text
      // first message sent by user is their name

      if (userName === false) {
        // remember user name
        userName  = htmlEntities(message.utf8Data)

        console.log(`${new Date()} User is known as: ${userName}.`)

      } else { // log and broadcast the message
        console.log(`${new Date()} Received Message from ${userName}: ${message.utf8Data}`)

        // we want to keep history of all sent messages
        const obj = {
          time  : Date.now(),
          text  : htmlEntities(message.utf8Data),
          author: userName,
        }

        history.push(obj)

        // broadcast message to all connected clients
        const json = JSON.stringify({
          type: 'message',
          data: obj,
        })

        clients.forEach(
          client => client.sendUTF(json)
        )
      }
    }
  })

  // user disconnected
  connection.on(
    'close',
    connection => {
      if (userName !== false) {
        console.log(`${new Date()} Peer ${connection.remoteAddress} disconnected.`)

        // remove user from the list of connected clients
        clients.splice(index, 1)
      }
    }
  )
})
