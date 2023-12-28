/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
    await knex.schema.createTable('users',(table) => {
      table.integer('id').notNullable().unique();
      table.text('email').notNullable().unique();
      table.string('name').notNullable();
      table.boolean('verified').defaultTo(false)
      table.dateTime('joined').notNullable();
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  await knex.schema.dropTable('users')
};
