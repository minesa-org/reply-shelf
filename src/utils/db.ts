import { MongoClient, Collection } from "mongodb";
import dotenv from "dotenv";

process.env.DOTENV_CONFIG_QUIET = "true";
dotenv.config();

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGO_DB_NAME || "replyshelf";
const collectionName = "replies"; // We'll use a specific collection for replies

let client: MongoClient;
let collection: Collection;

export interface SavedReply {
	name: string;
	content: string;
	userId: string;
	createdAt: Date;
}

export async function countReplies(userId: string) {
	const coll = await connect();
	return await coll.countDocuments({ userId });
}

async function connect() {
	if (!client) {
		client = new MongoClient(uri);
		await client.connect();
		const db = client.db(dbName);
		collection = db.collection(collectionName);
	}
	return collection;
}

export async function saveReply(reply: Omit<SavedReply, "createdAt">) {
	const coll = await connect();
	return await coll.updateOne(
		{ name: reply.name, userId: reply.userId },
		{ $set: { ...reply, createdAt: new Date() } },
		{ upsert: true },
	);
}

export async function getReply(name: string, userId: string) {
	const coll = await connect();
	return await coll.findOne({ name, userId });
}

export async function deleteReply(name: string, userId: string) {
	const coll = await connect();
	return await coll.deleteOne({ name, userId });
}

export async function listReplies(userId: string) {
	const coll = await connect();
	return await coll.find({ userId }).toArray();
}

export async function searchReplies(query: string, userId: string) {
	const coll = await connect();
	return await coll
		.find({
			userId,
			name: { $regex: query, $options: "i" },
		})
		.limit(25)
		.toArray();
}

export async function updateDiscordMetadata(
	userId: string,
	accessToken: string,
) {
	// For now, this is a placeholder to satisfy the import.
	// You might want to implement the actual Discord metadata update here.
	console.log(`Updating Discord metadata for user ${userId}`);
}
