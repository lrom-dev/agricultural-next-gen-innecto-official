export const defaultUsers = [];
export const defaultPosts = [];
export const defaultMessages = [];

export function syncProfileIdentityReferences({ profile, previousName, posts = [], marketplacePosts = [], researchPosts = [], messages = [] }) {
  if (previousName === profile.name) return { posts, marketplacePosts, researchPosts, messages };

  const updateRecords = (records) => records.map((record) => {
    const isAuthor = record.authorId === profile.id || (!record.authorId && record.author === previousName);
    const comments = Array.isArray(record.comments) ? record.comments.map((comment) => (
      typeof comment === 'string' && comment.startsWith(`${previousName}:`)
        ? `${profile.name}${comment.slice(previousName.length)}`
        : comment
    )) : record.comments;
    return {
      ...record,
      ...(isAuthor ? { author: profile.name, authorId: profile.id, authorRole: profile.role } : {}),
      ...(Array.isArray(record.comments) ? { comments } : {}),
    };
  });

  return {
    posts: updateRecords(posts),
    marketplacePosts: updateRecords(marketplacePosts),
    researchPosts: updateRecords(researchPosts),
    messages: messages.map((message) => ({
      ...message,
      sender: message.sender === previousName ? profile.name : message.sender,
      recipient: message.recipient === previousName ? profile.name : message.recipient,
    })),
  };
}

export function registerUser({ name, email, password, role }, users = defaultUsers) {
  const user = {
    id: cryptoRandomId(),
    name,
    email,
    password: hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  return users;
}

export function loginUser(email, password, users = defaultUsers) {
  const user = users.find(
    (entry) => String(entry.email || '').toLowerCase() === String(email).toLowerCase()
      && (entry.password === password || entry.password === hashPassword(password)),
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

export function createPost({ text, author, anonymous = false, posts = defaultPosts, title = '', caption = '', fileShared = 'No', ...rest }) {
  const post = {
    id: cryptoRandomId(),
    text,
    author,
    anonymous,
    title,
    caption,
    fileShared,
    likes: 0,
    reposts: 0,
    comments: [],
    createdAt: new Date().toISOString(),
    ...rest,
  };

  posts.push(post);
  return posts;
}

export function toggleLike(posts = defaultPosts, postId, userId = '') {
  return posts.map((post) => {
    if (post.id !== postId) return post;

    const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    if (userId && likedBy.includes(userId)) {
      return {
        ...post,
        likedBy: likedBy.filter((entry) => entry !== userId),
        likes: Math.max(0, Number(post.likes || 0) - 1),
      };
    }

    const nextLikedBy = userId ? [...likedBy, userId] : likedBy;
    return {
      ...post,
      likedBy: nextLikedBy,
      likes: Number(post.likes || 0) + 1,
    };
  });
}

export function getFilteredPosts(posts = defaultPosts, query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return posts;

  return posts.filter((post) => {
    const haystack = [post.text, post.title, post.caption, post.author, post.topic].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export function toggleSavedPost(savedPostIds = [], postKey) {
  const saved = Array.isArray(savedPostIds) ? savedPostIds : [];
  if (!postKey) return saved;
  return saved.includes(postKey)
    ? saved.filter((entry) => entry !== postKey)
    : [...saved, postKey];
}

export function countImradWords(fields = {}) {
  return ['introduction', 'methods', 'results', 'discussion'].reduce((total, field) => {
    const words = String(fields[field] ?? '').trim().split(/\s+/).filter(Boolean);
    return total + words.length;
  }, 0);
}

export function getMarketplaceProducts() {
  return [
    { id: 'product-coconut', name: 'Mature coconuts', category: 'Coconut', price: 'Request a quote', seller: 'Mindanao Harvest Co.', location: 'Davao del Sur', imageIndex: 0 },
    { id: 'product-banana', name: 'Lakatan bananas', category: 'Banana', price: 'Request a quote', seller: 'Bukidnon Growers Cooperative', location: 'Bukidnon', imageIndex: 1 },
    { id: 'product-pineapple', name: 'Fresh pineapples', category: 'Pineapple', price: 'Request a quote', seller: 'AgriNova Produce', location: 'Misamis Oriental', imageIndex: 2 },
    { id: 'product-sugarcane', name: 'Sugarcane', category: 'Sugarcane', price: 'Request a quote', seller: 'North Cotabato Farm Network', location: 'Cotabato', imageIndex: 3 },
    { id: 'product-rice', name: 'Milled rice', category: 'Rice', price: 'Request a quote', seller: 'Mindanao Harvest Co.', location: 'Bukidnon', imageIndex: 4 },
    { id: 'product-corn', name: 'Sweet corn', category: 'Corn', price: 'Request a quote', seller: 'AgriNova Produce', location: 'Davao del Sur', imageIndex: 5 },
    { id: 'product-cassava', name: 'Fresh cassava', category: 'Cassava', price: 'Request a quote', seller: 'North Cotabato Farm Network', location: 'Cotabato', imageIndex: 6 },
    { id: 'product-durian', name: 'Durian', category: 'Durian', price: 'Request a quote', seller: 'Bukidnon Growers Cooperative', location: 'Bukidnon', imageIndex: 7 },
  ];
}

export function sendMessage({ sender, recipient, text, thread = [] }) {
  const nextThread = [
    ...thread,
    {
      id: cryptoRandomId(),
      sender,
      recipient,
      text,
      createdAt: new Date().toISOString(),
    },
  ];

  return nextThread;
}

export function getPostCitations(post = {}) {
  const author = String(post.author || 'Anonymous Author').trim() || 'Anonymous Author';
  const title = String(post.title || post.text || 'Untitled post').trim() || 'Untitled post';
  const year = Number(new Date(post.createdAt || Date.now()).getFullYear()) || new Date().getFullYear();

  const authorParts = author.split(/\s+/).filter(Boolean);
  const givenName = authorParts.slice(0, -1).join(' ');
  const familyName = authorParts[authorParts.length - 1] || author;
  const apaFamily = familyName ? `${familyName}, ${authorParts[0]?.charAt(0)?.toUpperCase() || ''}.` : 'Anonymous Author';
  const mlaName = familyName ? `${familyName}, ${givenName || author}` : 'Anonymous Author';
  const chicagoName = familyName ? `${familyName}, ${givenName || author}` : 'Anonymous Author';

  return {
    apa: `${apaFamily} (${year}). ${title}. Community post.`,
    mla: `${mlaName}. "${title}." Community post, ${year}.`,
    chicago: `${chicagoName}. "${title}." Community post, ${year}.`,
    inText: `(${familyName || 'Anonymous'}, ${year})`,
  };
}

export function computeEngagementAnalytics(posts = []) {
  const values = posts.map((post) => {
    const comments = Array.isArray(post.comments) ? post.comments.length : Number(post.comments || 0);
    const likes = Number(post.likes || 0);
    const reposts = Number(post.reposts || 0);
    const citations = Number(post.citations || 0);
    return likes + comments + reposts + citations;
  });

  const totalInteractions = values.reduce((sum, value) => sum + value, 0);
  const totalPosts = posts.length;
  const meanInteractions = totalPosts ? Number((totalInteractions / totalPosts).toFixed(2)) : 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const medianInteractions = sorted.length % 2 === 0
    ? Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2))
    : Number(sorted[middle].toFixed(2));

  return {
    totalPosts,
    totalInteractions,
    meanInteractions,
    medianInteractions,
    maxInteractions: totalPosts ? Math.max(...values) : 0,
    minInteractions: totalPosts ? Math.min(...values) : 0,
    perPost: values,
  };
}

export function getDigitalMarketplaceFeed() {
  const commodityUpdates = [
    { symbol: 'MANGO', value: '₱48.60/kg', trend: '+4.1%', icon: '↗' },
    { symbol: 'RICE', value: '₱22.30/kg', trend: '+1.7%', icon: '↗' },
    { symbol: 'CORN', value: '₱18.90/kg', trend: '-0.8%', icon: '↘' },
    { symbol: 'COFFEE', value: '₱165.40/kg', trend: '+3.3%', icon: '↗' },
  ];

  const profiles = [
    { id: 'market-profile-1', name: 'AgriNova Tech', role: 'IoT sensors', location: 'Davao del Sur', type: 'Business', followers: 11840 },
    { id: 'market-profile-2', name: 'Mindanao Harvest Co.', role: 'Cold chain logistics', location: 'Bukidnon', type: 'Business', followers: 8430 },
    { id: 'market-profile-3', name: 'FarmGrid Labs', role: 'AI & governance', location: 'Cotabato', type: 'Startup', followers: 6225 },
    { id: 'market-profile-4', name: 'BlueRiver Irrigation', role: 'Infrastructure & water systems', location: 'Misamis Oriental', type: 'Business', followers: 9140 },
  ];

  const posts = [
    {
      id: 'market-post-1',
      author: 'AgriNova Tech',
      title: 'Smart irrigation for upland farms',
      caption: 'AI-powered water monitoring is helping growers save inputs and protect soil health.',
      topic: 'IoT, AI, innovation',
      text: 'Our IoT sensors and AI forecasting tools support resilient irrigation infrastructure for upland farmland and reduce water waste across key growing regions.',
      type: 'business',
      likes: 482,
      reposts: 23,
      comments: ['This is the future of climate-smart farming.'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'market-post-2',
      author: 'Mindanao Harvest Co.',
      title: 'Cold chain upgrade for banana exports',
      caption: 'A logistics network that protects quality and reduces produce loss.',
      topic: 'infrastructure, governance',
      text: 'New governance partnerships are helping local cooperatives improve logistics infrastructure, reduce spoilage, and keep fresh produce moving across regional markets.',
      type: 'advertisement',
      likes: 391,
      reposts: 18,
      comments: ['Strong partnership model for rural producers.'],
      createdAt: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: 'market-post-3',
      author: 'FarmGrid Labs',
      title: 'Data systems for resilient agriculture',
      caption: 'Governance, data quality, and digital traceability are critical for market access.',
      topic: 'AI, governance, innovation',
      text: 'FarmGrid Labs is building digital tools that combine AI, governance dashboards, and field data to help communities scale evidence-based agricultural decisions.',
      type: 'business',
      likes: 546,
      reposts: 31,
      comments: ['This kind of visibility helps farmers plan better.'],
      createdAt: new Date(Date.now() - 120000).toISOString(),
    },
  ];

  return { commodityUpdates, profiles, posts };
}

export function getProfilePosts(posts = defaultPosts, profileName = '') {
  const name = String(profileName || '').trim();
  if (!name) return [];

  return posts.filter((post) => post.author === name);
}

export function getPostsForOwner(posts = defaultPosts, user = {}) {
  const ownerId = String(user.id || '');
  const ownerName = String(user.name || '');
  if (!ownerId && !ownerName) return [];

  return posts.filter((post) => {
    if (ownerId) return post.authorId === ownerId;
    return Boolean(ownerName) && !post.authorId && post.author === ownerName;
  });
}

export function isProfileOwner(viewer = {}, profile = {}) {
  return Boolean(viewer.id && profile.id
    && String(viewer.id) === String(profile.id)
    && String(viewer.name || '') === String(profile.name || ''));
}

export function incrementPostCitation(posts = defaultPosts, postId) {
  return posts.map((post) => {
    if (post.id !== postId) return post;
    return { ...post, citations: Number(post.citations || 0) + 1 };
  });
}

export function editMessage(messages = defaultMessages, messageId, newText) {
  return messages.map((message) => {
    if (message.id !== messageId) return message;
    return { ...message, text: String(newText ?? '') };
  });
}

export function deleteMessage(messages = defaultMessages, messageId, actor = '', options = {}) {
  void options;
  if (!actor) return messages;

  return messages.filter((message) => {
    if (message.id !== messageId) return true;
    return message.sender !== actor;
  });
}

export function filterMessagesForViewer(messages = defaultMessages, viewerName = '') {
  const viewer = String(viewerName || '').trim();
  if (!viewer) return messages;

  return messages.filter((message) => {
    if (!message) return false;
    return message.sender === viewer || message.recipient === viewer;
  });
}

export function addComment(posts = defaultPosts, postId, text, author = 'You') {
  return posts.map((post) => {
    if (post.id !== postId) return post;
    const nextComments = Array.isArray(post.comments) ? [...post.comments] : [];
    nextComments.push(`${author}: ${text}`);
    return { ...post, comments: nextComments };
  });
}

export function hashPassword(value) {
  const raw = String(value ?? '');
  let hash = 0;
  for (let index = 0; index < raw.length; index += 1) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(index);
    hash |= 0;
  }
  return `hash-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

export function getKnownAccounts() {
  return [
    { id: 'seed-user-1', name: 'Roselyn G.', email: 'roselyn@example.com', password: 'seedpass', role: 'Soil Health Lead' },
    { id: 'seed-user-2', name: 'Aldrin P.', email: 'aldrin@example.com', password: 'seedpass', role: 'Cold Chain Partner' },
    { id: 'seed-user-3', name: 'Alma R.', email: 'alma@example.com', password: 'seedpass', role: 'Agronomist' },
    { id: 'seed-user-4', name: 'TestAcc_Alpha', email: 'alpha@example.com', password: 'seedpass', role: 'Community Member' },
    { id: 'seed-user-5', name: 'Mia Santos', email: 'mia@example.com', password: 'seedpass', role: 'Agri-Data Coordinator' },
    { id: 'seed-user-6', name: 'Lian Romano', email: 'lian@example.com', password: 'seedpass', role: 'Community Farmer' },
    { id: 'market-profile-1', name: 'AgriNova Tech', email: 'agrinova@example.com', password: 'seedpass', role: 'IoT sensors' },
    { id: 'market-profile-2', name: 'Mindanao Harvest Co.', email: 'harvest@example.com', password: 'seedpass', role: 'Cold chain logistics' },
    { id: 'market-profile-3', name: 'FarmGrid Labs', email: 'farmgrid@example.com', password: 'seedpass', role: 'AI & governance' },
    { id: 'market-profile-4', name: 'BlueRiver Irrigation', email: 'blueriver@example.com', password: 'seedpass', role: 'Infrastructure & water systems' },
  ];
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function generateCsvFromPosts(posts = []) {
  const header = ['POST-OO1', 'DATE', 'TITLE', 'CAPTION', 'FILE-SHARED', 'CONTENT'];
  const lines = [header.join(',')];

  posts.forEach((post, index) => {
    const values = [
      post.id || `POST-${String(index + 1).padStart(3, '0')}`,
      new Date(post.createdAt || Date.now()).toISOString().slice(0, 10),
      post.title || '',
      post.caption || post.text || '',
      post.fileShared || 'No',
      post.text || '',
    ];

    lines.push(
      values
        .map((value) => {
          const stringValue = String(value ?? '');
          const needsQuotes = /[",\n]/.test(stringValue);
          return needsQuotes ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
        })
        .join(','),
    );
  });

  return lines.join('\n');
}
