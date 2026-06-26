import { query } from './db'
import fs from 'fs'
import path from 'path'

export async function initDatabase() {
  try {
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf-8')
    const statements = schema.split(';').filter(s => s.trim())
    for (const stmt of statements) {
      if (stmt.trim()) {
        await query(stmt)
      }
    }
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}
