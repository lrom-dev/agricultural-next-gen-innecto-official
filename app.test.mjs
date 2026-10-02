import test from 'node:test';
import assert from 'node:assert/strict';

import {
  registerUser,
  loginUser,
  createPost,
  toggleLike,
  getFilteredPosts,
  sendMessage,
  getPostCitations,
  computeEngagementAnalytics,
  getDigitalMarketplaceFeed,
  generateCsvFromPosts,
  getPostsForOwner,
  isProfileOwner,
  incrementPostCitation,
  deleteMessage,
  getKnownAccounts,
  hashPassword,
  toggleSavedPost,
  countImradWords,
  getMarketplaceProducts,
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

test('loginUser accepts the displayed password for hashed demo accounts', () => {
  const accounts = getKnownAccounts().map((account) => ({
    ...account,
    password: hashPassword(account.password),
  }));

  assert.ok(loginUser('roselyn@example.com', 'seedpass', accounts));
});

test('all community and business demo accounts authenticate with the displayed password', () => {
  const accounts = getKnownAccounts();
  const storedAccounts = accounts.map((account) => ({ ...account, password: hashPassword(account.password) }));

  assert.equal(new Set(accounts.map((account) => account.email)).size, accounts.length);
  for (const account of accounts) {
    assert.ok(loginUser(account.email, account.password, storedAccounts), `${account.email} should authenticate`);
  }
});

test('registerUser appends to the supplied account list and keeps the password hashed', () => {
  const existing = [{ id: 'existing', name: 'Existing user' }];
  const users = registerUser({
    name: 'New Farmer',
    email: 'new@example.com',
    password: 'new-password',
    role: 'Farmer',
  }, existing);

  assert.equal(users.length, 2);
  assert.equal(users[1].password, hashPassword('new-password'));
  assert.ok(loginUser('new@example.com', 'new-password', users));
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

test('toggleLike reverses the count when the same user unlikes', () => {
  const post = { id: 'toggle-post', likes: 0, likedBy: [] };
  const liked = toggleLike([post], post.id, 'user-1');
  const unliked = toggleLike(liked, post.id, 'user-1');

  assert.equal(liked[0].likes, 1);
  assert.equal(unliked[0].likes, 0);
  assert.deepEqual(unliked[0].likedBy, []);
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

test('toggleSavedPost adds and removes a post key without mutating saved state', () => {
  const saved = ['community:post-1'];
  const withSecond = toggleSavedPost(saved, 'marketplace:post-2');
  const withoutFirst = toggleSavedPost(withSecond, 'community:post-1');

  assert.deepEqual(saved, ['community:post-1']);
  assert.deepEqual(withSecond, ['community:post-1', 'marketplace:post-2']);
  assert.deepEqual(withoutFirst, ['marketplace:post-2']);
  assert.equal(toggleSavedPost(saved, ''), saved);
});

test('countImradWords counts all abstract fields and the 250-word boundary', () => {
  assert.equal(countImradWords({ introduction: 'Field health', methods: 'Three plots', results: 'Yield rose', discussion: 'Repeat locally' }), 8);
  assert.equal(countImradWords({ discussion: Array(250).fill('word').join(' ') }), 250);
  assert.equal(countImradWords({ discussion: Array(251).fill('word').join(' ') }), 251);
});

test('marketplace products map all eight supplied crop images to quote listings', () => {
  const products = getMarketplaceProducts();

  assert.equal(products.length, 8);
  assert.deepEqual(products.map((product) => product.imageIndex), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.ok(products.every((product) => product.price === 'Request a quote' && product.seller));
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

test('getPostCitations provides APA, MLA, Chicago, and in-text reference styles', () => {
  const citations = getPostCitations({
    author: 'Lian Romano',
    title: 'Smart irrigation in upland farms',
    createdAt: '2026-03-10T12:30:00.000Z',
    text: 'This post examines climate-smart irrigation for Mindanao farms.',
  });

  assert.equal(citations.apa.includes('Romano, L.'), true);
  assert.equal(citations.mla.includes('Romano, Lian'), true);
  assert.equal(citations.chicago.includes('Romano, Lian'), true);
  assert.equal(citations.inText.includes('(Romano'), true);
});

test('computeEngagementAnalytics summarizes the performance metrics for a post set', () => {
  const analytics = computeEngagementAnalytics([
    { id: 'a', likes: 12, comments: ['1', '2'], reposts: 4 },
    { id: 'b', likes: 8, comments: ['1'], reposts: 2 },
    { id: 'c', likes: 20, comments: [], reposts: 6 },
  ]);

  assert.equal(analytics.totalPosts, 3);
  assert.equal(analytics.totalInteractions, 55);
  assert.equal(analytics.meanInteractions, 18.33);
  assert.equal(analytics.medianInteractions, 18);
  assert.equal(analytics.maxInteractions, 26);
  assert.equal(analytics.minInteractions, 11);
});

test('getPostsForOwner only returns the signed-in user posts', () => {
  const posts = [
    { id: 'mine', author: 'Lian', authorId: 'user-1' },
    { id: 'legacy-mine', author: 'Lian' },
    { id: 'theirs', author: 'Alma', authorId: 'user-2' },
  ];

  assert.deepEqual(getPostsForOwner(posts, { id: 'user-1', name: 'Lian' }).map((post) => post.id), ['mine']);
  assert.deepEqual(getPostsForOwner(posts, { name: 'Lian' }).map((post) => post.id), ['legacy-mine']);
});

test('isProfileOwner rejects different IDs, display-name collisions, and fallback profiles', () => {
  assert.equal(isProfileOwner({ id: 'user-1', name: 'A Farmer' }, { id: 'user-1', name: 'A Farmer' }), true);
  assert.equal(isProfileOwner({ id: 'user-2', name: 'A Farmer' }, { id: 'user-1', name: 'A Farmer' }), false);
  assert.equal(isProfileOwner({ id: 'user-1', name: 'A Farmer' }, { id: 'user-1', name: 'Fallback profile' }), false);
  assert.equal(isProfileOwner({ name: 'A Farmer' }, { name: 'A Farmer' }), false);
});

test('incrementPostCitation increments only the selected post counter', () => {
  const posts = [{ id: 'a', citations: 2 }, { id: 'b', citations: 8 }];
  const updated = incrementPostCitation(posts, 'a');

  assert.equal(updated[0].citations, 3);
  assert.equal(updated[1].citations, 8);
});

test('deleteMessage only removes a message sent by the requesting user', () => {
  const messages = [
    { id: 'mine', sender: 'Lian', recipient: 'Alma' },
    { id: 'theirs', sender: 'Alma', recipient: 'Lian' },
  ];

  const updated = deleteMessage(messages, 'theirs', 'Lian');
  assert.deepEqual(updated.map((message) => message.id), ['mine', 'theirs']);
  assert.deepEqual(deleteMessage(messages, 'mine', 'Lian').map((message) => message.id), ['theirs']);
});

test('getDigitalMarketplaceFeed returns mock market posts with search-friendly content', () => {
  const market = getDigitalMarketplaceFeed();

  assert.ok(Array.isArray(market.posts));
  assert.ok(Array.isArray(market.profiles));
  assert.ok(Array.isArray(market.commodityUpdates));
  assert.ok(market.posts.some((post) => /IoT|AI|innovation|infrastructure|governance/i.test(post.topic || post.text || '')));
});

test('generateCsvFromPosts exports a CSV with the requested headers', () => {
  const csv = generateCsvFromPosts([
    {
      id: 'POST-001',
      createdAt: '2026-03-10',
      title: 'Smart irrigation',
      caption: 'Soil moisture improves efficiency',
      fileShared: 'No',
      text: 'We piloted sensor-based irrigation in the field.',
    },
  ]);

  assert.match(csv, /POST-OO1,DATE,TITLE,CAPTION,FILE-SHARED,CONTENT/);
  assert.match(csv, /POST-001/);
});
