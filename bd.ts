import * as fs from "fs";
const basePath = "./database/";

interface Model {
  [key: string]: string; // Maps field names to data types as strings
}

interface TableData<T> {
  records: T[];
  model: Model | null;
}

interface User {
  id: number;
  name: string;
  age: number;
}

interface DatabaseSchema {
  [key: string]: object;
  users: User;
  matheus: User;
}

class Database<Schema extends { [key: string]: object }> {
  tables: { [K in keyof Schema]: Table<Schema[K]> } = {} as {
    [K in keyof Schema]: Table<Schema[K]>;
  };

  constructor() {
    this.#initializeDatabase();
  }

  #initializeDatabase() {
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
    const tablePath = `${basePath}${String(tableName)}.json`;
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

class Table<T extends object> {
  #name: string;
  #filePath: string;
  #model: Model | null;

  constructor(name: string, filePath: string) {
    this.#name = name;
    this.#filePath = filePath;
    const data = this.readData();
    this.#model = data.model || null;
  }

  readData(): TableData<T> {
    return JSON.parse(fs.readFileSync(this.#filePath, "utf-8"));
  }

  saveData(data: TableData<T>) {
    fs.writeFileSync(this.#filePath, JSON.stringify(data, null, 2));
  }

  setModel(model: Model) {
    const data = this.readData();
    data.model = model;
    this.#model = model;
    this.saveData(data);
  }

  validateRecord(record: T): boolean {
    if (!this.#model) return true; // Without a model, any record is valid

    for (const field in this.#model) {
      if (!(field in record)) {
        console.log(`Error: Missing field '${field}' in record.`);
        return false;
      }
      const expectedType = this.#model[field];
      const actualType = typeof (record as any)[field];
      if (actualType !== expectedType) {
        console.log(
          `Error: Field '${field}' should be of type '${expectedType}', but is '${actualType}'.`
        );
        return false;
      }
    }
    return true;
  }

  insert(record: T) {
    if (this.validateRecord(record)) {
      const data = this.readData();
      data.records.push(record);
      this.saveData(data);
      console.log(`Record inserted into table '${this.#name}'.`);
    } else {
      console.log(`Invalid record for table '${this.#name}'.`);
    }
  }

  query(filter: (record: T) => boolean = () => true): T[] {
    const data = this.readData();
    return data.records.filter(filter);
  }

  update(filter: (record: T) => boolean, newData: Partial<T>) {
    const data = this.readData();
    let updatedCount = 0;
    data.records = data.records.map((record) => {
      if (filter(record)) {
        const updated = { ...record, ...newData };
        if (this.validateRecord(updated as T)) {
          updatedCount++;
          return updated as T;
        } else {
          console.log("Error: Invalid data in update.");
        }
      }
      return record;
    });
    this.saveData(data);
    console.log(`${updatedCount} record(s) updated in table '${this.#name}'.`);
  }

  delete(filter: (record: T) => boolean) {
    const data = this.readData();
    const originalCount = data.records.length;
    data.records = data.records.filter((record) => !filter(record));
    this.saveData(data);
    const deletedCount = originalCount - data.records.length;
    console.log(
      `${deletedCount} record(s) deleted from table '${this.#name}'.`
    );
  }
}

const db = new Database<DatabaseSchema>();
db.createTable("users", { id: "number", name: "string", age: "number" });
db.createTable("matheus", { id: "number", name: "string", age: "number" });

db.tables.matheus.setModel({
  id: "number",
  name: "string",
  age: "number",
  email: "string",
});

const t = db.tables.matheus.readData()
console.log(t);