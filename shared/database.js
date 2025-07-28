const { MongoClient } = require('mongodb');

const CONNECTION_STRING = process.env.COSMOS_DB_CONNECTION_STRING || process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'pim-app';

if (!CONNECTION_STRING) {
  throw new Error('No database connection string defined');
}

let client;
async function getClient() {
  if (client && client.topology && client.topology.isConnected()) {
    return client;
  }
  client = new MongoClient(CONNECTION_STRING);
  await client.connect();
  return client;
}

async function getCollection(name) {
  const cli = await getClient();
  return cli.db(DATABASE_NAME).collection(name);
}

function createResponse(status, data = null, message) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };
  if (message !== undefined && message !== null) {
    const errorMessage = typeof message === 'string' ? message : message.message || String(message);
    return { status, headers, body: { error: errorMessage } };
  }
  return { status, headers, body: data };
}

function validateRequired(obj, fields) {
  const missing = fields.filter((f) => obj[f] === undefined || obj[f] === null || obj[f] === '');
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

function sanitizeId(id) {
  return String(id || '').replace(/[^a-fA-F0-9]/g, '');
}

module.exports = {
  getCollection,
  createResponse,
  validateRequired,
  sanitizeId,
};
