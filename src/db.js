import { createPool } from "mysql2/promise";
import { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } from "./config.js";

// Desarrollo
// export const pool = createPool(
//     {
//         user: 'root',
//         password: '',
//         host: 'localhost',
//         port: 3306,
//         database: 'perfumes_web'
//     }
// )

//Produccion
export const pool = createPool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
});
