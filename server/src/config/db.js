const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'globetrotter.sqlite');

let sqlDb = null;
let SQL = null;

function saveDb() {
  if (!sqlDb) return;
  const data = sqlDb.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

class DbWrapper {
  constructor() {
    this.ready = false;
    this.initPromise = this.init();
  }

  async init() {
    SQL = await initSqlJs();
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      sqlDb = new SQL.Database(fileBuffer);
    } else {
      sqlDb = new SQL.Database();
      this.initSchema();
      this.save();
    }
    this.ready = true;
    return this;
  }

  save() {
    saveDb();
  }

  initSchema() {
    sqlDb.run(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        avatar_url TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        currency TEXT DEFAULT 'USD',
        language TEXT DEFAULT 'en',
        travel_style TEXT DEFAULT 'Balanced',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        region TEXT NOT NULL,
        cost_index INTEGER NOT NULL DEFAULT 3,
        popularity_score INTEGER NOT NULL DEFAULT 80,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        avg_daily_cost REAL NOT NULL DEFAULT 120.0,
        currency TEXT NOT NULL DEFAULT 'USD',
        latitude REAL,
        longitude REAL
      );

      CREATE TABLE IF NOT EXISTS city_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        cost REAL NOT NULL DEFAULT 0.0,
        duration_hours REAL NOT NULL DEFAULT 2.0,
        rating REAL NOT NULL DEFAULT 4.5,
        image_url TEXT NOT NULL,
        location_address TEXT DEFAULT '',
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        cover_image TEXT DEFAULT '',
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        total_budget REAL NOT NULL DEFAULT 1000.0,
        currency TEXT NOT NULL DEFAULT 'USD',
        is_public INTEGER NOT NULL DEFAULT 0,
        share_token TEXT UNIQUE,
        status TEXT NOT NULL DEFAULT 'Upcoming',
        travel_style TEXT DEFAULT 'Balanced',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS trip_stops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        city_id INTEGER NOT NULL,
        stop_order INTEGER NOT NULL DEFAULT 1,
        arrival_date TEXT NOT NULL,
        departure_date TEXT NOT NULL,
        accommodation_name TEXT DEFAULT '',
        accommodation_cost REAL DEFAULT 0.0,
        transport_type TEXT DEFAULT 'Flight',
        transport_cost REAL DEFAULT 0.0,
        notes TEXT DEFAULT '',
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE RESTRICT
      );

      CREATE TABLE IF NOT EXISTS trip_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        stop_id INTEGER NOT NULL,
        activity_id INTEGER,
        custom_title TEXT,
        custom_description TEXT,
        category TEXT DEFAULT 'Sightseeing',
        date TEXT NOT NULL,
        time_slot TEXT DEFAULT 'Morning',
        estimated_cost REAL NOT NULL DEFAULT 0.0,
        duration_hours REAL DEFAULT 2.0,
        status TEXT DEFAULT 'planned',
        order_index INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE,
        FOREIGN KEY (activity_id) REFERENCES city_activities(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS user_saved_destinations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        city_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, city_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action_type TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
  }

  exec(sql) {
    sqlDb.exec(sql);
    this.save();
  }

  prepare(sql) {
    const self = this;
    return {
      all: (params = []) => {
        const stmt = sqlDb.prepare(sql);
        if (Array.isArray(params) || typeof params === 'object') {
          stmt.bind(params);
        }
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      get: (params = []) => {
        const stmt = sqlDb.prepare(sql);
        if (Array.isArray(params) || typeof params === 'object') {
          stmt.bind(params);
        }
        let result = null;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      },
      run: (params = []) => {
        if (params && !Array.isArray(params) && typeof params === 'object') {
          const stmt = sqlDb.prepare(sql);
          stmt.bind(params);
          stmt.step();
          stmt.free();
        } else {
          sqlDb.run(sql, params || []);
        }

        // IMPORTANT: Extract last_insert_rowid() and changes() BEFORE saving to disk!
        // (calling .export() resets sqlite's internal last_insert_rowid register)
        const lastIdRes = sqlDb.exec("SELECT last_insert_rowid() as id;");
        const lastInsertRowid = lastIdRes.length && lastIdRes[0].values.length ? lastIdRes[0].values[0][0] : null;
        const changesRes = sqlDb.exec("SELECT changes() as c;");
        const changes = changesRes.length && changesRes[0].values.length ? changesRes[0].values[0][0] : 1;

        self.save();

        return {
          lastInsertRowid,
          changes
        };
      }
    };
  }
}

const dbInstance = new DbWrapper();

module.exports = dbInstance;
