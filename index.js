/*
eslint
no-multi-spaces: ["error", {exceptions: {"VariableDeclarator": true}}]
padded-blocks: ["error", {"classes": "always"}]
max-len: ["error", 80]
*/
'use strict'

const { ServerCredentials, Server, load } = require('grpc')
const isObject      = require('is.object')
const getPropValue  = require('get-property-value')

class GrpcServer {

  constructor (config = {}) {
    const address = config.address || '0.0.0.0:50051'
    const credentials = isObject(config.credentials)
      ? setAuthentication(config.credentials)
      : ServerCredentials.createInsecure()

    this._server = new Server()
    this._server.bind(address, credentials)
  }

  addServices (services = []) {
    if (!services.length) {
      this._server.forceShutdown()
      throw new Error('you must add some services')
    }

    try {
      for (let svc in services) {
        const service = `${services[svc].package}.${services[svc].name}.service`
        const proto = getPropValue(load(services[svc].proto), service)

        this._server.addService(proto, services[svc].methods)
      }
    } catch (ex) {
      this._server.forceShutdown()
      throw new Error(`check your service config and proto file: ${ex.message}`)
    }

    return this
  }

  start (cb) {
    this._server.start()

    cb()
  }

  stop (cb) {
    this._server.tryShutdown(shutdow)

    function shutdow () {
      setTimeout(cb, 50)
    }
  }

}

module.exports = function factory (config) {
  return new GrpcServer(config)
}

//
// help functions
//

function setAuthentication (certs) {

  return ServerCredentials.createSsl(
    null,
    [
      {
        'cert_chain': certs.server,
        'private_key': certs.key
      }
    ]
  )
}
