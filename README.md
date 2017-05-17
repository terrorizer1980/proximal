proximal
========
Minimal JSON RPC over HTTP with Proxy/Promise interface.

Installation
------------

    $ npm install proximal

Usage
-----

### Server
```javascript
  const proximal = require('proximal');

  let rpc = new proximal.Server({
    modules: {
      foo: require('./foo'),
      bar: require('./bar')
    }
  });

```

#### Express
```javascript
  const express = require('express');
  let app = express();

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    next();
  });

  // body-parser is optional
  app.post('/rpc', rpc.middleware());
  app.listen(8888);
```

### Client
```javascript
  let rpc = new proximal.Client({
    url: 'http://example.tld:8888/rpc'
  });

  let foo = rpc.getModule('foo');

  foo.doSomething('arg1', 'arg2').then(result => {
    // your result from remote `foo.doSomething` method here
  });

  foo.doesNotExist('arg1').then(null, err => {
    // Error: method not found
  });
```

License
-------
This software is released under the terms of the **MIT license**. See `LICENSE`.
