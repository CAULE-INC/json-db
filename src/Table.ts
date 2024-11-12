import * as fs from "fs";

export interface Model {
  [key: string]: string;
}

export interface TableData<T> {
  records: T[];
  model: Model | null;
}

export class Table<T extends object> {
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
