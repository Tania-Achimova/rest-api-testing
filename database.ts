// src/db.ts
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB_NAME as string;

if (!uri) throw new Error("Missing MONGODB_URI in .env");
if (!dbName) throw new Error("Missing MONGODB_DB_NAME in .env");

let client: MongoClient;
let db: Db;

export async function connectToDB(): Promise<Db> {
  if (db) return db; // reuse existing connection

  client = new MongoClient(uri);
  await client.connect();

  console.log("✅ Connected to MongoDB");

  db = client.db(dbName);
  return db;
}

export async function closeDB() {
  await client?.close();
  console.log("🔌 MongoDB connection closed");
}
