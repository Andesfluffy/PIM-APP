const { MongoClient } = require('mongodb');

class DatabaseService {
    constructor() {
        this.client = null;
        this.db = null;
    }

    async connect() {
        if (!this.client) {
            // Get connection string from environment variables
            const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
            this.client = new MongoClient(connectionString);
            await this.client.connect();
            this.db = this.client.db('pim-database');
        }
        return this.db;
    }

    async getCollection(collectionName) {
        const db = await this.connect();
        return db.collection(collectionName);
    }

    // Generic CRUD operations
    async create(collectionName, document) {
        const collection = await this.getCollection(collectionName);
        document.createdAt = new Date();
        document.updatedAt = new Date();
        const result = await collection.insertOne(document);
        return { ...document, _id: result.insertedId };
    }

    async findByUserId(collectionName, userId) {
        const collection = await this.getCollection(collectionName);
        return await collection.find({ userId }).toArray();
    }

    async findById(collectionName, id, userId) {
        const collection = await this.getCollection(collectionName);
        return await collection.findOne({ _id: id, userId });
    }

    async updateById(collectionName, id, userId, updateData) {
        const collection = await this.getCollection(collectionName);
        updateData.updatedAt = new Date();
        const result = await collection.updateOne(
            { _id: id, userId },
            { $set: updateData }
        );
        return result.modifiedCount > 0;
    }

    async deleteById(collectionName, id, userId) {
        const collection = await this.getCollection(collectionName);
        const result = await collection.deleteOne({ _id: id, userId });
        return result.deletedCount > 0;
    }
}

module.exports = new DatabaseService();