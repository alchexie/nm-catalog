/*
  Modify database structure manually

  Entry point for running structure migrations on an EXISTING database
  (e.g. a database created by an older init-db).

  To add a new migration, follow the project's established workflow:

    1. Write a new migration script under packages/core/src/db/update/
       (e.g. sql_260801.ts), following the same style as the archived ones
       in packages/core/src/db/update/archive/*.txt (self-contained:
       opens its own connection via DB_PATH, runs SQL, closes it).
    2. Export it from packages/core/src/index.ts as updateSqlXXXXXX.
    3. Import and call it below, in chronological order.
*/

import { info } from '@nm-catalog/core';
// import { info, updateSql260801 } from '@nm-catalog/core';

// updateSql260801();   // uncomment to run the latest migration
// ...more migrations in chronological order...

info('Database modified!');
