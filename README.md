# grpc.server

a simple abstraction around grpc.Server


----
<a href="https://nodei.co/npm/grpc.server/"><img src="https://nodei.co/npm/grpc.server.png?downloads=true"></a>

[![Build Status](https://travis-ci.org/joaquimserafim/grpc.server.svg?branch=master)](https://travis-ci.org/joaquimserafim/grpc.server)[![Coverage Status](https://coveralls.io/repos/github/joaquimserafim/grpc.server/badge.svg)](https://coveralls.io/github/joaquimserafim/grpc.server)[![ISC License](https://img.shields.io/badge/license-ISC-blue.svg?style=flat-square)](https://github.com/joaquimserafim/grpc.server/blob/master/LICENSE)[![NodeJS](https://img.shields.io/badge/node-6.x.x-brightgreen.svg?style=flat-square)](https://github.com/joaquimserafim/grpc.server/blob/master/package.json#L53)

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


### api
`const server = require('grpc.server')`

* **server(an optional {})**
  - **address** string with the format `url:port`
  - **credentials** can use `credentials.createInsecure` or with certificates through an object { key, server }, passed as a Buffer
  - **metadata** set metadata that can be used in all calls, an array with { key: value }

**methods**
  * **addServices(an array with the services object)**
    - **package** proto package name
    - **name** service name
    - **proto** proto file
    - **methods** an object with the methods
  * **start(callback function)**
  * **stop(callback function)**


**note:** you can use `unary`, `stream` or `bidirecional` since the comm type should be handled on the proto files and in the methods

### example


```js
const server = require('grpc.server')

// proto file
/*
syntax = "proto3";

package helloWorld;

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc sayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
*/

const serverA = server()

const services = [
  {
    proto: protos.helloWorld,
    package: 'helloWorld',
    name: 'Greeter',
    methods: { sayHello: sayHello }
  }
]

serverA.
  .addServices(services)
  .startc(cb)


// to stop the server
serverA.stop(cb)

```


#### ISC License (ISC)
