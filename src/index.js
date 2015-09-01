const Promise = require('bluebird');
const Datastore = require('nedb');

/**
 * @namespace nedb
 */
export const nedb = {};

/**
 * Accepts config parameters
 * @memberof nedb
 * @param {Object} cfg Configuration
 */
nedb.config = (cfg) => {
  nedb.db = Promise.promisifyAll(new Datastore(cfg));
  return true;
};

/**
 * Creates a new entry in the database
 * @memberof nedb
 * @param {Object} body Contents to create entry
 * @param {String|Number} [version] The version of the model to use
 * @returns {Object} promise
 */
nedb.create = function (body, version = false) {
  // Test validation
  const validationErrors = this.validate(body, version);
  // Return promise
  return new Promise((resolve, reject) => {
    /* istanbul ignore if */
    if (validationErrors) {
      reject(validationErrors);
    } else {
      resolve(nedb.db.insertAsync(body));
    }
  });
};

/**
 * Reads from the database
 * @memberof nedb
 * @param {Object} query Specific id or query to construct read
 * @param {Number|String} version The version of the model to match
 * @returns {Object} promise
 */
nedb.read = function (query, version = false) {
  const sanitize = this.sanitize;
  return new Promise((resolve, reject) => {
    nedb.db.findAsync(query)
      .then((results) => {
        const tmp = [];
        results.forEach((r) => {
          tmp.push(sanitize(r, version));
        });
        resolve(tmp);
      })
      .catch((err) => reject(err));
  });
};

/**
 * Updates an entry in the database
 * @memberof nedb
 * @param {String} query Query to locate entries to update
 * @param {Object} body Contents to update
 * @param {String|Number} [version] The version of the model to use
 * @returns {Object} promise
 */
nedb.update = function (query, body, version = false) {
  // Test validation
  const validationErrors = this.validate(body, version);
  // Return promise
  return new Promise((resolve, reject) => {
    /* istanbul ignore if */
    if (validationErrors) {
      reject(validationErrors);
    } else {
      resolve(nedb.db.updateAsync(query, { $set: body }, { multi: true }));
    }
  });
};

/**
 * Deletes an item from the database
 * @memberof nedb
 * @param {Object} query Query to locate entries to delete
 * @returns {Object} promise
 */
nedb.delete = (query) => nedb.db.removeAsync(query, { multi: true });

/**
 * Extends adapter by adding new method
 * @memberof nedb
 * @param {String} name The name of the method
 * @param {Function} fn The method to add
 */
nedb.extend = (name, fn) => {
  nedb[name] = fn.bind(nedb);
};
