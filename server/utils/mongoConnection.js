const dns = require('dns');

const parseDnsServers = () => {
  const raw = process.env.MONGODB_DNS_SERVERS || process.env.MONGO_DNS_SERVERS || process.env.DB_DNS_SERVERS;
  if (!raw) {
    return ['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4'];
  }

  return Array.from(
    new Set(
      raw
        .split(',')
        .map((server) => server.trim())
        .filter(Boolean)
    )
  );
};

const DEFAULT_DNS_SERVERS = parseDnsServers();

let dnsFallbackApplied = false;

const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || process.env.MONGO_DB || 'anime-blog';

const buildLocalUri = (dbName = DEFAULT_DB_NAME) => `mongodb://localhost:27017/${dbName}`;

const ensureDatabaseName = (uri, dbName) => {
  if (!uri) {
    return uri;
  }

  const sanitizedDbName = (dbName || '').replace(/^\//, '').trim();
  if (!sanitizedDbName) {
    return uri;
  }

  // Only adjust when target host points to MongoDB Atlas or when no db is provided.
  const hasAtlasHost = uri.includes('mongodb.net');
  if (!hasAtlasHost) {
    return uri;
  }

  if (uri.includes(`/${sanitizedDbName}`)) {
    return uri;
  }

  if (uri.includes('/?')) {
    return uri.replace('/?', `/${sanitizedDbName}?`);
  }

  if (uri.endsWith('/')) {
    return `${uri}${sanitizedDbName}`;
  }

  // When no database name is present before query params.
  const hasDbName = /\/[^/?]+(?=\?|$)/.test(uri);
  if (!hasDbName && uri.includes('?')) {
    const [base, query] = uri.split('?');
    return `${base}/${sanitizedDbName}?${query}`;
  }

  if (!hasDbName) {
    return `${uri}/${sanitizedDbName}`;
  }

  return uri;
};

const isSrvUri = (uri) =>
  typeof uri === 'string' && uri.trim().toLowerCase().startsWith('mongodb+srv://');

const collectMessages = (error) => {
  if (!error) {
    return [];
  }

  const messages = new Set();

  const traverse = (err) => {
    if (!err) return;

    if (err.message) {
      messages.add(err.message);
    }

    if (err.reason) {
      traverse(err.reason);
    }

    if (err.originalError) {
      traverse(err.originalError);
    }
  };

  traverse(error);

  return Array.from(messages);
};

const isSrvLookupError = (error) => {
  if (!error) {
    return false;
  }

  const codesToCheck = [
    error.code,
    error.errno,
    error?.reason?.code,
    error?.originalError?.code
  ].filter(Boolean);

  const hostsToCheck = [
    error.hostname,
    error.address,
    error?.reason?.hostname,
    error?.reason?.address,
    error?.originalError?.hostname
  ].filter(Boolean);

  const hasSrvHost = hostsToCheck.some(
    (host) => typeof host === 'string' && host.startsWith('_mongodb._tcp')
  );

  if (hasSrvHost && codesToCheck.some((code) => code === 'ENOTFOUND' || code === 'ENODATA')) {
    return true;
  }

  const messages = collectMessages(error);
  return messages.some(
    (message) =>
      /querySrv\s+ENOTFOUND/i.test(message) ||
      (message.includes('_mongodb._tcp') &&
        (message.includes('ENOTFOUND') || message.includes('ENODATA')))
  );
};

const applyDnsFallback = () => {
  if (dnsFallbackApplied) {
    return false;
  }

  if (!DEFAULT_DNS_SERVERS.length) {
    return false;
  }

  try {
    dns.setServers(DEFAULT_DNS_SERVERS);
    dnsFallbackApplied = true;
    console.warn(
      `[DB] Applied fallback DNS servers for MongoDB SRV lookups: ${DEFAULT_DNS_SERVERS.join(', ')}`
    );
    return true;
  } catch (error) {
    console.error('[DB] Failed to apply fallback DNS servers:', error.message);
    return false;
  }
};

const withSrvFallback = async (connectFn, uri, options) => {
  if (typeof connectFn !== 'function') {
    throw new TypeError('connectFn must be a function');
  }

  const attemptConnection = () => Promise.resolve(connectFn(uri, options));

  try {
    return await attemptConnection();
  } catch (error) {
    if (isSrvUri(uri) && isSrvLookupError(error)) {
      if (applyDnsFallback()) {
        console.warn('[DB] Retrying MongoDB connection after DNS fallback setup...');
        return attemptConnection();
      }
    }

    throw error;
  }
};

const getMongoConfig = () => {
  const dbName = DEFAULT_DB_NAME;

  const sources = [
    { key: 'MONGODB_URI', value: process.env.MONGODB_URI },
    { key: 'MONGO_URI', value: process.env.MONGO_URI },
    { key: 'DATABASE_URL', value: process.env.DATABASE_URL },
    { key: 'MONGODB_URL', value: process.env.MONGODB_URL }
  ];

  const resolvedSource =
    sources.find((entry) => typeof entry.value === 'string' && entry.value.trim().length > 0) ||
    null;

  let uri = resolvedSource?.value?.trim();
  let source = resolvedSource?.key || 'LOCAL_DEFAULT';

  if (!uri) {
    uri = buildLocalUri(dbName);
  } else {
    uri = ensureDatabaseName(uri, dbName);
  }

  return {
    uri,
    dbName,
    source,
    isSrv: isSrvUri(uri),
    isAtlas: uri.includes('mongodb.net'),
    isFallback: source === 'LOCAL_DEFAULT'
  };
};

const getConnectionOptions = (overrides = {}) => ({
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  readPreference: 'secondaryPreferred',
  readConcern: { level: 'majority' },
  writeConcern: { w: 'majority', j: true, wtimeout: 10000 },
  compressors: ['zlib'],
  zlibCompressionLevel: 6,
  ...overrides
});

const maskMongoUriCredentials = (uri) => {
  if (typeof uri !== 'string') {
    return uri;
  }

  if (!uri.includes('@')) {
    return uri;
  }

  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^@]+)@/i, (match, protocol, credentials) => {
    if (!credentials.includes(':')) {
      return `${protocol}***@`;
    }
    return `${protocol}***:***@`;
  });
};

const getDefaultDnsServers = () => DEFAULT_DNS_SERVERS.slice();

module.exports = {
  getMongoConfig,
  getConnectionOptions,
  withSrvFallback,
  applyDnsFallback,
  isSrvLookupError,
  isSrvUri,
  getDefaultDnsServers,
  maskMongoUriCredentials
};
