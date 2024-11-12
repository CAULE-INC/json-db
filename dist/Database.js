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
var _Database_instances, _Database_basePath, _Database_initializeDatabase, _Database_setModel;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const fs = __importStar(require("fs"));
const Table_1 = require("./Table");
class Database {
    constructor(basePath) {
        _Database_instances.add(this);
        this.tables = {};
        _Database_basePath.set(this, void 0);
        __classPrivateFieldGet(this, _Database_instances, "m", _Database_initializeDatabase).call(this, basePath);
        __classPrivateFieldSet(this, _Database_basePath, basePath, "f");
    }
    createTable(tableName, model) {
        const tablePath = `${__classPrivateFieldGet(this, _Database_basePath, "f")}${String(tableName)}.json`;
        if (!fs.existsSync(tablePath)) {
            fs.writeFileSync(tablePath, JSON.stringify({ records: [], model: null }));
            console.log(`Table '${String(tableName)}' created.`);
        }
        this.tables[tableName] = new Table_1.Table(String(tableName), tablePath);
        __classPrivateFieldGet(this, _Database_instances, "m", _Database_setModel).call(this, tableName, model);
    }
}
exports.Database = Database;
_Database_basePath = new WeakMap(), _Database_instances = new WeakSet(), _Database_initializeDatabase = function _Database_initializeDatabase(basePath) {
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
    }
    const files = fs
        .readdirSync(basePath)
        .filter((file) => file.endsWith(".json"));
    files.forEach((file) => {
        const tableName = file.replace(".json", "");
        if (tableName in this.tables) {
            this.tables[tableName] = new Table_1.Table(tableName, `${basePath}${file}`);
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
