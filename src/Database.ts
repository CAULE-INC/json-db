import * as fs from "fs";

import { Model, Table } from "./Table";

export class Database<Schema extends { [key: string]: object }> {
  tables: { [K in keyof Schema]: Table<Schema[K]> } = {} as {
    [K in keyof Schema]: Table<Schema[K]>;
  };

  #basePath: string;

  constructor(basePath: string) {
    this.#initializeDatabase(basePath);
    this.#basePath = basePath;
  }

  #initializeDatabase(basePath: string) {
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath);
    }

    const files = fs
      .readdirSync(basePath)
      .filter((file) => file.endsWith(".json"));
    files.forEach((file) => {
      const tableName = file.replace(".json", "");
      if (tableName in this.tables) {
        this.tables[tableName as keyof Schema] = new Table(
          tableName,
          `${basePath}${file}`
        ) as Table<Schema[keyof Schema]>;
        console.log(`Table '${tableName}' loaded.`);
      }
    });
  }

  createTable<K extends keyof Schema>(tableName: K, model: Model) {
    const tablePath = `${this.#basePath}${String(tableName)}.json`;
    if (!fs.existsSync(tablePath)) {
      fs.writeFileSync(tablePath, JSON.stringify({ records: [], model: null }));
      console.log(`Table '${String(tableName)}' created.`);
    }
    this.tables[tableName] = new Table<Schema[K]>(String(tableName), tablePath);
    this.#setModel(tableName, model);
  }

  #setModel<K extends keyof Schema>(tableName: K, model: Model) {
    if (this.tables[tableName]) {
      this.tables[tableName]!.setModel(model);
      console.log(`Model set for table '${String(tableName)}'.`);
    } else {
      console.log(`Table '${String(tableName)}' does not exist.`);
    }
  }
}
