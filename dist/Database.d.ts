import { Model, Table } from "./Table";
export declare class Database<Schema extends {
    [key: string]: object;
}> {
    #private;
    tables: {
        [K in keyof Schema]: Table<Schema[K]>;
    };
    constructor(basePath: string);
    createTable<K extends keyof Schema>(tableName: K, model: Model): void;
}
