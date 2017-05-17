/*
 * proximal - minimal JSON RPC over HTTP with Proxy/Promise interface
 * https://github.com/gavinhungry/proximal
 */

((global, props, factory) => {
  (typeof define === 'function' && define.amd) ? define(props.name, factory) :
  (typeof module === 'object' && module.exports) ? module.exports = factory() :
  global[props.export || props.name] = factory();
})(this, {
  name: 'proximal'
}, () => {
  'use strict';

  /**
   * Proximal client constructor
   *
   * @param {Object} opts
   * @param {String} opts.url - URL of remote endpoint
   */
  let Client = (() => {
    let Client = function ProximalClient(opts = {}) {
      if (!opts.url) {
        throw new Error('url is required');
      }

      this.url = opts.url;
    };

    Client.prototype = {
      /**
       * Get a Proxy object representing a remote module
       *
       * @param {String} moduleName
       * @return {Proxy}
       */
      getModule: function(moduleName) {
        if (!moduleName) {
          throw new Error('moduleName is required');
        }

        return new Proxy({
          url: this.url,
          moduleName: moduleName
        }, {
          get: (obj, methodName) => {
            return (...args) => {
              return new Promise((res, rej) => {
                let xhr = new XMLHttpRequest();
                xhr.open('POST', this.url);
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.onerror = e => rej(xhr.responseText);
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
      }
    };

    return Client;
  })();

  /**
   * Proximal server constructor
   *
   * @param {Object} opts
   * @param {Object} opts.modules - map of modules to be included
   */
  let Server = (() => {
    class ImplError extends Error {};

    let Server = function ProximalServer(opts = {}) {
      if (!opts.modules || !Object.keys(opts.modules).length) {
        throw new Error('modules are required');
      }

      this.modules = opts.modules;
    };

    Server.prototype = {
      /**
       * Get the parsed JSON body from a request, even without body-parser
       *
       * @private
       *
       * @param {Request} req
       * @return {Promise<Object>}
       */
      _getReqCall: function(req) {
        if (!req) {
          throw new Error('no body');
        }

        if (req.body) {
          return Promise.resolve(req.body);
        }

        return new Promise((resolve, reject) => {
          let data = '';
          req.on('data', chunk => data += chunk );
          req.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch(err) {
              reject(err);
            }
          });
        });
      },

      /**
       * Get the result of a module method
       *
       * @private
       *
       * @param {Object} call
       * @param {String} call.moduleName
       * @param {String} call.methodName
       * @param {Array<Mixed>} call.args
       * @return {Mixed} method result
       */
      _getCallResult: function(call = {}) {
        let module = this.modules[call.moduleName];
        if (!module) {
          throw new ImplError('module not found');
        }

        let method = module[call.methodName];
        if (!method || typeof method !== 'function') {
          throw new ImplError('method not found');
        }

        return method.apply(module, call.args);
      },

      /**
       *
       */
      middleware: function() {
        return (req, res) => {
          this._getReqCall(req).then(call => this._getCallResult(call), err => {
            res.status(400).json('Error parsing RPC request body');
          }).then(result => res.json(result), err => {
            res.status(err instanceof ImplError ? 501 : 500).json(err.message);
          });
        };
      }
    };

    return Server;
  })();

  return { Client, Server };
});
