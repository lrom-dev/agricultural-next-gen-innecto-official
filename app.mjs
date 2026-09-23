const defaultUsers = [];
const defaultPosts = [];
const defaultMessages = [];

export function registerUser({ name, email, password, role }) {
  const user = {
    id: cryptoRandomId(),
    name,
    email,
    password,
    role,
    createdAt: new Date().toISOString(),
  };

  defaultUsers.push(user);
  return defaultUsers;
}

export function loginUser(email, password, users = defaultUsers) {
  const user = users.find(
    (entry) => entry.email.toLowerCase() === String(email).toLowerCase() && entry.password === password,
  );

  if (!user) return null;

  return {
    token: cryptoRandomId(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export function createPost({ text, author, anonymous = false, posts = defaultPosts }) {
  const post = {
    id: cryptoRandomId(),
    text,
    author,
    anonymous,
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  posts.push(post);
  return posts;
}

export function toggleLike(posts = defaultPosts, postId) {
  return posts.map((post) => {
    if (post.id !== postId) return post;
    return { ...post, likes: post.likes + 1 };
  });
}

export function getFilteredPosts(posts = defaultPosts, query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return posts;

  return posts.filter((post) => post.text.toLowerCase().includes(q));
}

export function sendMessage({ sender, recipient, text, thread = [] }) {
  const nextThread = [
    ...thread,
    {
      sender,
      recipient,
      text,
      createdAt: new Date().toISOString(),
    },
  ];

  return nextThread;
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
