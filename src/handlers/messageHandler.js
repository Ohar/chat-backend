const clientList   = require('./../consts/clientList')
const history      = require('./../consts/history')
const htmlEntities = require('./../utils/htmlEntities')

function messageHandler (user) {
  return (message) => {
    if (message.type === 'utf8') { // accept only text
      // first message sent by user is their name

      if (user.name === false) {
        // remember user name
        user.name = htmlEntities(message.utf8Data)

        console.log(`${new Date()} User is known as: ${user.name}.`)

      } else { // log and broadcast the message
        console.log(`${new Date()} Received Message from ${user.name}: ${message.utf8Data}`)

        // we want to keep history of all sent messages
        const obj = {
          time  : Date.now(),
          text  : htmlEntities(message.utf8Data),
          author: user.name,
        }

        history.push(obj)

        // broadcast message to all connected clientList
        const json = JSON.stringify({
          type: 'message',
          data: obj,
        })

        clientList.forEach(
          client => client.sendUTF(json),
        )
      }
    }
  }
}

module.exports = messageHandler
