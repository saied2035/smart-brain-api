/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
    await knex.schema.createTable('codes',(table) => {
        table.increments();
        table.text('email').notNullable().unique();
        table.string('code', 6).notNullable();
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  await  knex.schema.dropTable('codes');
};
