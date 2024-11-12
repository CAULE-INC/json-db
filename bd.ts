import { Database } from "./src/Database";

const basePath = "./database/";

interface User {
  id: number;
  name: string;
  age: number;
}



interface DatabaseSchema {
  [key: string]: any;
  users: User;
  matheus: User;
}
const db = new Database<DatabaseSchema>(basePath);
db.createTable("users", { id: "number", name: "string", age: "number" });

const t = db.tables.matheus.readData()
console.log(t);