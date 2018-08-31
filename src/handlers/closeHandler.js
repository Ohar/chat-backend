const clientList = require('./../consts/clientList')

function closeHandler (user) {
  return ({connection, index}) => {
    if (user.name !== false) {
      console.log(`${new Date()} Peer ${connection.remoteAddress} disconnected.`)

      // remove user from the list of connected clientList
      clientList.splice(index, 1)
    }
  }
}

module.exports = closeHandler
