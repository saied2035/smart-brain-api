require('dotenv').config();
// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'pg',
    connection: {
      database: 'smart_brain_development'
    }
  },

    production: {
    client: 'cockroachdb',
    connection: process.env.PRODUCTION_DATABASE_URL
  }
};
