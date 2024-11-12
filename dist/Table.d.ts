export interface Model {
    [key: string]: string;
}
export interface TableData<T> {
    records: T[];
    model: Model | null;
}
export declare class Table<T extends object> {
    #private;
    constructor(name: string, filePath: string);
    readData(): TableData<T>;
    saveData(data: TableData<T>): void;
    setModel(model: Model): void;
    validateRecord(record: T): boolean;
    insert(record: T): void;
    query(filter?: (record: T) => boolean): T[];
    update(filter: (record: T) => boolean, newData: Partial<T>): void;
    delete(filter: (record: T) => boolean): void;
}
