/*
 * proximal - minimal JSON RPC over HTTP with Proxy/Promise interface
 * https://github.com/gavinhungry/proximal
 */

(() => {
  'use strict';

  /**
   *
   */
  let Proximal = function(opts = {}) {
    this.modules = opts.modules;
  };

  /**
   * @private
   */
  let _getBody = req => {
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
  };

  /**
   * @private
   */
  let _getResult = (data = {}, modules = {}) => {
    let module = modules[data.moduleName];
    if (!module) {
      throw new Error('module not found');
    }

    let method = module[data.methodName];
    if (!method) {
      throw new Error('method not found');
    }

    return method.apply(module, data.args);
  };

  /**
   *
   */
  Proximal.prototype.middleware = function() {
    return (req, res) => {
      _getBody(req).then(body => _getResult(body, this.modules)).then(result => {
        res.json(result);
      }, err => {
        console.error(err);
        res.status(500).end();
      });
    };
  };

  module.exports = Proximal;

})();
