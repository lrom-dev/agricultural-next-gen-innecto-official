import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const databaseDir = path.dirname(new URL(import.meta.url).pathname);
mkdirSync(databaseDir, { recursive: true });

const db = new DatabaseSync(path.join(databaseDir, 'ani-social.db'));

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  anonymous INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT
);
`;

db.exec(schema);

const seededUsers = [
  {
    id: 'seed-user-1',
    name: 'Lian Romano',
    email: 'lian@ani.social',
    password: 'hash:dd120673',
    role: 'Farmer',
    created_at: new Date().toISOString(),
  },
  {
    id: 'seed-user-2',
    name: 'Test User',
    email: 'test@ani.social',
    password: 'hash:dd120673',
    role: 'Innovator',
    created_at: new Date().toISOString(),
  },
  {
    id: 'seed-user-3',
    name: 'Alma R.',
    email: 'alma@ani.social',
    role: 'Agronomist',
    password: 'hash:dd120673',
    created_at: new Date().toISOString(),
  },
];

const seededPosts = [];

const seededMessages = [];

for (const user of seededUsers) {
  db.prepare(
    `INSERT OR IGNORE INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(user.id, user.name, user.email, user.password, user.role, user.created_at);
}

for (const post of seededPosts) {
  db.prepare(
    `INSERT OR IGNORE INTO posts (id, text, author, anonymous, likes, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(post.id, post.text, post.author, post.anonymous, post.likes, post.created_at);
}

for (const message of seededMessages) {
  db.prepare(
    `INSERT OR IGNORE INTO messages (id, sender, recipient, text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(message.id, message.sender, message.recipient, message.text, message.created_at, message.updated_at);
}

console.log(`Database initialized at ${path.join(databaseDir, 'ani-social.db')}`);
console.log('Seed users:', db.prepare('SELECT COUNT(*) AS count FROM users').get().count);
console.log('Seed posts:', db.prepare('SELECT COUNT(*) AS count FROM posts').get().count);
console.log('Seed messages:', db.prepare('SELECT COUNT(*) AS count FROM messages').get().count);

export { db };
