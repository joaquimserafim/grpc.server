/*
eslint
no-multi-spaces: ["error", {exceptions: {"VariableDeclarator": true}}]
padded-blocks: ["error", {"classes": "always"}]
max-len: ["error", 80]
*/
'use strict'

const { describe, it, before } = require('mocha')
const { expect }        = require('chai')
const client            = require('grpc.client')
const { readFileSync }  = require('fs')

const server = require('../')

var serverCerts = {}
var clientCerts = {}

const protos = {
  helloWorld: 'test/protos/hello-world.proto',
  helloWorldStream: 'test/protos/hello-world-stream.proto'
}

const services = [
  {
    proto: protos.helloWorld,
    package: 'helloWorld',
    name: 'Greeter',
    methods: { sayHello: sayHello }
  }
]

// var bigFile = null

describe('gRPC server', () => {

  before((done) => {

    const key = readFileSync('test/fixtures/certs/server_private.key')
    const crt = readFileSync('test/fixtures/certs/server.crt')
    const ca = readFileSync('test/fixtures/certs/ca.crt')

    serverCerts = {
      key: key,
      server: crt
    }

    clientCerts = {
      ca: ca,
      key: key,
      client: crt
    }

    done()
  })

  it('should throw an error when not passing any service', (done) => {
    const ex = function ex () {
      server().addServices().start()
    }

    expect(ex).to.throw('you must add some services')
    done()
  })

  it('should throw an error when passing an invalid proto file',
    (done) => {
      let serverA = server(
        {
          credentials: serverCerts,
          address: '127.0.0.1:50052'
        }
      )

      let res = function () {
        serverA.addServices([{ name: 'bah' }])
      }

      expect(res).to
        .throw(
          'check your service config and proto file: ' +
          'Cannot read property \'ns\' of null'
        )
      done()
    }
  )

  it('should do a rpc call between server / client', (done) => {
    let serverA = server()

    serverA
      .addServices(services)
      .start(() => {
        client()
          .service('Greeter', protos.helloWorld)
          .sayHello({ name: 'Scaramouche' })
          .end((err, res) => {
            expect(err).to.be.deep.equal(null)
            expect(res).to.be.deep.equal({ message: 'Hello Scaramouche' })
            serverA.stop(done)
          })
      })
  })

  it('should do a rpc call between server / client for an authenticated' +
    ' server / client',
    function (done) {
      this.timeout(120000)
      let serverA = server(
        {
          credentials: serverCerts,
          address: 'localhost:50052'
        }
      )

      const service = [
        {
          proto: protos.helloWorld,
          package: 'helloWorld',
          name: 'Greeter',
          methods: { sayHello: sayHello }
        }
      ]

      serverA
        .addServices(service)
        .start(() => {
          client({ address: 'localhost:50052', credentials: clientCerts })
            .service('Greeter', protos.helloWorld)
            .sayHello({ name: 'Scaramouche' })
            .end((err, res) => {
              expect(err).to.be.deep.equal(null)
              expect(res).to.be.deep.equal({ message: 'Hello Scaramouche' })
              serverA.stop(done)
            })
        })
    }
  )
})

//
//
//

function sayHello (call, cb) {
  cb(null, { message: 'Hello ' + call.request.name })
}
