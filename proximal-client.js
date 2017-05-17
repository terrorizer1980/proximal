/*
 * proximal - minimal JSON RPC over HTTP with Proxy/Promise interface
 * https://github.com/gavinhungry/proximal
 */

(global => {
  'use strict';

  /**
   *
   */
  let Proximal = function(opts = {}) {
    this.url = opts.url;
  };

  /**
   *
   */
  Proximal.prototype.getModule = function(moduleName) {
    return new Proxy({
      url: this.url,
      moduleName: moduleName
    }, {
      get: (target, methodName) => {
        return (...args) => {
          return new Promise((res, rej) => {
            let xhr = new XMLHttpRequest();
            xhr.open('POST', this.url);
            xhr.setRequestHeader('Content-type', 'application/json');

            xhr.onerror = e => rej(xhr.statusText);
            xhr.onload = e => {
              if (xhr.status !== 200) {
                return xhr.onerror(e);
              }

              res(JSON.parse(xhr.responseText));
            };

            xhr.send(JSON.stringify({ moduleName, methodName, args }));
          });
        };
      }
    });
  };

  global.Proximal = Proximal; // FIXME

})(this);
