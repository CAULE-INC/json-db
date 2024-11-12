"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Database_instances, _Database_initializeDatabase, _Database_setModel, _Table_name, _Table_filePath, _Table_model;
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const basePath = "./database/";
class Database {
    constructor() {
        _Database_instances.add(this);
        this.tables = {};
        __classPrivateFieldGet(this, _Database_instances, "m", _Database_initializeDatabase).call(this);
    }
    createTable(tableName, model) {
        const tablePath = `${basePath}${String(tableName)}.json`;
        if (!fs.existsSync(tablePath)) {
            fs.writeFileSync(tablePath, JSON.stringify({ records: [], model: null }));
            console.log(`Table '${String(tableName)}' created.`);
        }
        this.tables[tableName] = new Table(String(tableName), tablePath);
        __classPrivateFieldGet(this, _Database_instances, "m", _Database_setModel).call(this, tableName, model);
    }
}
_Database_instances = new WeakSet(), _Database_initializeDatabase = function _Database_initializeDatabase() {
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
    }
    const files = fs
        .readdirSync(basePath)
        .filter((file) => file.endsWith(".json"));
    files.forEach((file) => {
        const tableName = file.replace(".json", "");
        if (tableName in this.tables) {
            this.tables[tableName] = new Table(tableName, `${basePath}${file}`);
            console.log(`Table '${tableName}' loaded.`);
        }
    });
}, _Database_setModel = function _Database_setModel(tableName, model) {
    if (this.tables[tableName]) {
        this.tables[tableName].setModel(model);
        console.log(`Model set for table '${String(tableName)}'.`);
    }
    else {
        console.log(`Table '${String(tableName)}' does not exist.`);
    }
};
class Table {
    constructor(name, filePath) {
        _Table_name.set(this, void 0);
        _Table_filePath.set(this, void 0);
        _Table_model.set(this, void 0);
        __classPrivateFieldSet(this, _Table_name, name, "f");
        __classPrivateFieldSet(this, _Table_filePath, filePath, "f");
        const data = this.readData();
        __classPrivateFieldSet(this, _Table_model, data.model || null, "f");
    }
    readData() {
        return JSON.parse(fs.readFileSync(__classPrivateFieldGet(this, _Table_filePath, "f"), "utf-8"));
    }
    saveData(data) {
        fs.writeFileSync(__classPrivateFieldGet(this, _Table_filePath, "f"), JSON.stringify(data, null, 2));
    }
    setModel(model) {
        const data = this.readData();
        data.model = model;
        __classPrivateFieldSet(this, _Table_model, model, "f");
        this.saveData(data);
    }
    validateRecord(record) {
        if (!__classPrivateFieldGet(this, _Table_model, "f"))
            return true; // Without a model, any record is valid
        for (const field in __classPrivateFieldGet(this, _Table_model, "f")) {
            if (!(field in record)) {
                console.log(`Error: Missing field '${field}' in record.`);
                return false;
            }
            const expectedType = __classPrivateFieldGet(this, _Table_model, "f")[field];
            const actualType = typeof record[field];
            if (actualType !== expectedType) {
                console.log(`Error: Field '${field}' should be of type '${expectedType}', but is '${actualType}'.`);
                return false;
            }
        }
        return true;
    }
    insert(record) {
        if (this.validateRecord(record)) {
            const data = this.readData();
            data.records.push(record);
            this.saveData(data);
            console.log(`Record inserted into table '${__classPrivateFieldGet(this, _Table_name, "f")}'.`);
        }
        else {
            console.log(`Invalid record for table '${__classPrivateFieldGet(this, _Table_name, "f")}'.`);
        }
    }
    query(filter = () => true) {
        const data = this.readData();
        return data.records.filter(filter);
    }
    update(filter, newData) {
        const data = this.readData();
        let updatedCount = 0;
        data.records = data.records.map((record) => {
            if (filter(record)) {
                const updated = Object.assign(Object.assign({}, record), newData);
                if (this.validateRecord(updated)) {
                    updatedCount++;
                    return updated;
                }
                else {
                    console.log("Error: Invalid data in update.");
                }
            }
            return record;
        });
        this.saveData(data);
        console.log(`${updatedCount} record(s) updated in table '${__classPrivateFieldGet(this, _Table_name, "f")}'.`);
    }
    delete(filter) {
        const data = this.readData();
        const originalCount = data.records.length;
        data.records = data.records.filter((record) => !filter(record));
        this.saveData(data);
        const deletedCount = originalCount - data.records.length;
        console.log(`${deletedCount} record(s) deleted from table '${__classPrivateFieldGet(this, _Table_name, "f")}'.`);
    }
}
_Table_name = new WeakMap(), _Table_filePath = new WeakMap(), _Table_model = new WeakMap();
const db = new Database();
db.createTable("users", { id: "number", name: "string", age: "number" });
db.createTable("matheus", { id: "number", name: "string", age: "number" });
db.tables.matheus.setModel({
    id: "number",
    name: "string",
    age: "number",
    email: "string",
});
const t = db.tables.matheus.readData();
console.log(t);
