#!/usr/bin/env -S node -r dotenv/config

// This script can be used in several ways:
// * with the `--check` option it makes sure that migrations and schema are
//   consistent. If they are not, the script fails and outputs a series of SQL
//   statements that, if added to the schema, would make it consistent with the
//   migrations. This is mostly meant as an indicator of the inconsistency.
//   Usually the displayed remedy shouldn't be appended at the end of the
//   schema, but put into the right places. E.g. `ALTER TABLE foo ALTER COLUMN
//   bar SET NOT NULL` should not be appended at the end - rather the `CREATE
//   TABLE foo` should be found and `NOT NULL` added to the definition of
//   column `bar`.
// * with the `--createMigration migration-name` option, a new migration file
//   is created in the `database/migrations` folder with an autogenerated
//   migration that would ensure consistency between migrations and the schema.
//   The autogenerated migration is *one* way to get from the previous schema
//   to the current one. When making changes to the schema, you can start with
//   that autogenerated migration, but make sure that it carries out the
//   migration in the intended way. E.g. it might suggest to drop a column and
//   create a new one, when you mean to rename an existing column instead.
//   Also, the autogenerated migration only does structural changes to the
//   database, but you might want to add data operations. For example, if you
//   were to add a `NOT NULL` constraint to some column in the schema, the
//   autogenerated migration will provide the correct `ALTER TABLE ... ALTER
//   COLUMN ... SET NOT NULL` statement for you (and the inverse in the
//   down-migration), but this migration would fail if the database has rows in
//   that table where that column currently is NULL. So, you would have to add
//   statements to the migration to deal with that, e.g. `DELETE FROM table
//   WHERE column IS NULL` or `UPDATE table SET column=DEFAULT WHERE column IS
//   NULL`, or whatever is the right thing to do in the particular situation.
//   There is no way to autogenerate the *correct* migration, but the
//   autogenerated migration can still be useful as an indicator of all the
//   things that need to be migrated.  And for some migrations, they will even
//   be correct.
// * there are two more options: `--checkSchema` and `--checkMigrations` apply
//   the schema and the migrations, respectively, to an empty temporary
//   database to check they are syntactically sound and valid.

import { promises as fs } from 'fs';

import prettier from 'prettier';
import yargs from 'yargs';

import { format } from 'database/tooling/pg-formatter.ts';
import {
  installMigra,
  migra,
  runSequelizeMigrate,
} from 'database/tooling/migra.ts';
import {
  withTemporaryDatabase,
  executeSqlFile,
} from 'database/tooling/utils.ts';

async function main() {
  const { argv } = yargs(process.argv.slice(2))
    .option('checkMigrations', {
      type: 'boolean',
      description:
        'Check that all migrations can be applied to an empty database with ' +
        'no errors',
    })
    .option('checkSchema', {
      type: 'boolean',
      description:
        'Check if schema description can be applied to an empty database ' +
        'with no errors',
    })
    .option('check', {
      type: 'boolean',
      description:
        'Check that both migrations and schema description can be applied to ' +
        'an empty database with no error and yield identical schema. Any ' +
        'diff that touches the database/ directory should be tested with ' +
        'this option.',
    })
    .option('createMigration', {
      type: 'string',
      description:
        'Create a new database migration that reflects changes in the schema ' +
        'description. You must provide a name for the new migration which ' +
        'will then be saved in ' +
        'database/migrations/<current time>_<name provided>.cjs',
    })
    .option('checkDatabase', {
      type: 'boolean',
      description:
        'Compare the current live database schema (of the database ' +
        'configured in your .env) against the schema definition file',
    })
    .help();

  const {
    checkMigrations,
    checkSchema,
    check,
    createMigration,
    checkDatabase,
  } = argv;

  if (
    !(
      checkMigrations ||
      checkSchema ||
      check ||
      createMigration ||
      checkDatabase
    )
  ) {
    yargs.showHelp();
    throw null;
  }
  if (
    createMigration &&
    (checkMigrations || checkSchema || check || checkDatabase)
  ) {
    throw 'Do not mix the --createMigration option with other options!';
  }

  if (check || createMigration || checkDatabase) {
    await installMigra();
  }

  const needSchemaDatabase = !!(
    checkSchema ||
    check ||
    createMigration ||
    checkDatabase
  );
  const needMigrationsDatabase = !!(
    checkMigrations ||
    check ||
    createMigration
  );
  let upMigration: string | null = null;
  let downMigration: string | null = null;

  await withTemporaryDatabaseIfNeeded(
    needSchemaDatabase,
    async (schemaDatabase) => {
      if (schemaDatabase !== null) {
        try {
          await executeSqlFile('database/schema.sql', schemaDatabase);
        } catch (_) {
          throw 'Failed to apply database schema migration to empty database';
        }
      }

      if (needMigrationsDatabase) {
        await withTemporaryDatabase(async (migrationsDatabase) => {
          try {
            await runSequelizeMigrate(migrationsDatabase);
          } catch (_) {
            throw 'Failed to apply all database migrations to empty database';
          }

          if ((check || createMigration) && schemaDatabase !== null) {
            downMigration = await migra(
              postgresUrl(schemaDatabase),
              postgresUrl(migrationsDatabase),
              'cord',
            );

            if (check && downMigration !== null) {
              throw (
                'The database migrations are not consistent with the full ' +
                'database schema definition.\n' +
                'Adding the following statements to the schema definition ' +
                'would make it consistent with the migrations:\n\n' +
                prepareMigration(downMigration, '', false)
              );
            }

            if (createMigration) {
              if (downMigration === null) {
                throw (
                  'No changes to database schema detected. ' +
                  'No database migration generated.'
                );
              } else {
                upMigration = await migra(
                  postgresUrl(migrationsDatabase),
                  postgresUrl(schemaDatabase),
                  'cord',
                );
              }
            }
          }
        });
      }

      if (checkDatabase && schemaDatabase) {
        const { POSTGRES_DB } = process.env;

        if (!POSTGRES_DB) {
          throw new Error(
            'Using the --checkDatabase option requires you to set POSTGRES_DB',
          );
        }

        const migration = await migra(
          postgresUrl(schemaDatabase),
          postgresUrl(POSTGRES_DB),
          'cord',
        );

        if (migration === null) {
          console.log(
            "The configured database's schema is consistent with the schema definition",
          );
        } else {
          throw (
            "The configured database's schema is not consistent with the full " +
            'database schema definition.\n' +
            'Adding the following statements to the schema definition ' +
            'would make it consistent with the database:\n\n' +
            prepareMigration(migration, '', false)
          );
        }
      }
    },
  );

  if (createMigration) {
    const migrationFile = `'use strict';

          module.exports = {
            up: (queryInterface) =>
              queryInterface.sequelize.query(\`${prepareMigration(
                upMigration ?? '',
              )}\`),
           down: (queryInterface) =>
              queryInterface.sequelize.query(\`${prepareMigration(
                downMigration ?? '',
              )}\`),
          };`;

    const now = new Date();
    const timestamp =
      now.getUTCFullYear().toString() +
      (now.getUTCMonth() + 1).toString().padStart(2, '0') +
      now.getUTCDate().toString().padStart(2, '0') +
      now.getUTCHours().toString().padStart(2, '0') +
      now.getUTCMinutes().toString().padStart(2, '0') +
      now.getUTCSeconds().toString().padStart(2, '0');
    const filename = `database/migrations/${timestamp}-${createMigration}.cjs`;

    const formattedMigrationFile = await prettier.format(migrationFile, {
      filepath: filename,
      ...(await prettier.resolveConfig(filename)),
    });

    await fs.writeFile(filename, formattedMigrationFile);
    console.log(`New database written to ${filename}`);
  }
}

function prepareMigration(sql: string, indent = '      ', transaction = true) {
  sql = format(sql.trim(), { keywordCase: 'uppercase', noRcFile: true }).trim();
  if (transaction) {
    sql = `\nBEGIN;\n\n${sql}\n\nCOMMIT;`;
  }
  return sql.replace(/\n/g, `\n${indent}`).replace(/ +(\n|$)/g, '$1');
}

function postgresUrl(database: string) {
  const u = new URL('postgresql://');

  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT } =
    process.env;

  if (POSTGRES_USER) {
    u.username = POSTGRES_USER;
  }

  if (POSTGRES_PASSWORD) {
    u.password = POSTGRES_PASSWORD;
  }

  if (POSTGRES_HOST) {
    if (POSTGRES_HOST[0] === '/') {
      // Unix domain socket connection, must be specified as a search parameter
      u.searchParams.append('host', POSTGRES_HOST);
    } else {
      u.host = encodeURIComponent(POSTGRES_HOST);
    }
  }

  if (POSTGRES_PORT) {
    u.port = POSTGRES_PORT;
  }

  u.pathname = database;

  return u.toString();
}

function withTemporaryDatabaseIfNeeded<T>(
  needed: boolean,
  func: (arg: string | null) => Promise<T>,
) {
  if (needed) {
    return withTemporaryDatabase(func);
  } else {
    return func(null);
  }
}

main().then(
  () => {
    process.exit(0);
  },
  (err) => {
    if (err != null) {
      console.error('\n');
      console.error(err);
    }
    process.exit(1);
  },
);
