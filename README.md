proximal
========
Minimal JSON RPC over HTTP with Proxy/Promise interface.

Usage
-----

### Server
```javascript
  let Proximal = require('./proximal-server');

  let proximal = new Proximal({
    modules: {
      foo: require('./foo'),
      bar: require('./bar')
    }
  });

```

#### Express
```javascript
  let express = require('express');
  let app = express();

  api.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'localhost');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    next();
  });

  // body-parser is optional
  api.post('/rpc', proximal.middleware());
  api.listen(8888);
```

### Client
```javascript
  let proximal = new Proximal({
    url: 'http://localhost:8888/rpc'
  });

  let foo = proximal.getModule('foo');

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
