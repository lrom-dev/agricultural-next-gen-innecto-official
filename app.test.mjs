import test from 'node:test';
import assert from 'node:assert/strict';

import {
  registerUser,
  loginUser,
  createPost,
  toggleLike,
  getFilteredPosts,
  sendMessage,
} from './app.mjs';

test('registerUser stores a new user and returns it', () => {
  const users = registerUser({
    name: 'Test Farmer',
    email: 'test@example.com',
    password: 'secret123',
    role: 'Farmer',
  });

  assert.equal(users.length, 1);
  assert.equal(users[0].name, 'Test Farmer');
  assert.equal(users[0].email, 'test@example.com');
});

test('loginUser authenticates a registered user', () => {
  const created = registerUser({
    name: 'Test Farmer 2',
    email: 'another@example.com',
    password: 'secret123',
    role: 'Innovator',
  });

  const session = loginUser('another@example.com', 'secret123', created);
  assert.ok(session);
  assert.equal(session.user.email, 'another@example.com');
});

test('createPost adds content and supports anonymous sharing', () => {
  const posts = createPost({
    text: 'New drip irrigation trial',
    author: 'Lian',
    anonymous: true,
  });

  assert.equal(posts.length, 1);
  assert.equal(posts[0].anonymous, true);
  assert.equal(posts[0].text, 'New drip irrigation trial');
});

test('toggleLike increases the like count', () => {
  const posts = createPost({
    text: 'Compost trial',
    author: 'Ana',
    anonymous: false,
  });

  const updated = toggleLike(posts, posts[0].id);
  assert.equal(updated[0].likes, 1);
});

test('getFilteredPosts filters by query', () => {
  const posts = [
    { id: 'a', text: 'Rice irrigation update', author: 'Lian', anonymous: false },
    { id: 'b', text: 'Banana market research', author: 'Alma', anonymous: false },
  ];

  const filtered = getFilteredPosts(posts, 'irrigation');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'a');
});

test('sendMessage stores a chat item', () => {
  const messages = sendMessage({
    sender: 'Lian',
    recipient: 'Alma',
    text: 'Can you share the seedling schedule?',
    thread: [
      { sender: 'Alma', text: 'Hi!' },
    ],
  });

  assert.equal(messages.length, 2);
  assert.equal(messages[1].text, 'Can you share the seedling schedule?');
});
