import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI as string | undefined;
const dbName = process.env.DATABASE_NAME || "pim";

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

const client = new MongoClient(uri);

async function getCollection() {
  await client.connect();
  return client.db(dbName).collection("notes");
}

module.exports = async function (context: any, req: any) {
  context.log("Notes function processed a request.");

  context.res = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  };

  if (req.method === "OPTIONS") {
    context.res.status = 200;
    return;
  }

  const collection = await getCollection();
  const id = req.params.id;

  try {
    switch (req.method) {
      case "GET":
        if (id) {
          const note = await collection.findOne({ _id: new ObjectId(id) });
          if (note) {
            context.res.status = 200;
            context.res.body = note;
          } else {
            context.res.status = 404;
            context.res.body = { error: "Note not found" };
          }
        } else {
          const notes = await collection
            .find()
            .sort({ createdAt: -1 })
            .toArray();
          context.res.status = 200;
          context.res.body = notes;
        }
        break;
      case "POST":
        const newNote = {
          title: req.body?.title || "Untitled Note",
          content: req.body?.content || "",
          tags: req.body?.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const insertResult = await collection.insertOne(newNote);
        const created = await collection.findOne({ _id: insertResult.insertedId });
        context.res.status = 201;
        context.res.body = created;
        break;
      case "PUT":
        if (!id) {
          context.res.status = 400;
          context.res.body = { error: "Note ID is required" };
          break;
        }
        const updateData: any = {
          title: req.body?.title,
          content: req.body?.content,
          tags: req.body?.tags,
          updatedAt: new Date(),
        };
        Object.keys(updateData).forEach(
          (k) => updateData[k] === undefined && delete updateData[k]
        );
        const updateResult = await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: "after" }
        );
        if (!updateResult.value) {
          context.res.status = 404;
          context.res.body = { error: "Note not found" };
        } else {
          context.res.status = 200;
          context.res.body = updateResult.value;
        }
        break;
      case "DELETE":
        if (!id) {
          context.res.status = 400;
          context.res.body = { error: "Note ID is required" };
          break;
        }
        await collection.deleteOne({ _id: new ObjectId(id) });
        context.res.status = 204;
        break;
      default:
        context.res.status = 405;
        context.res.body = { error: "Method not allowed" };
    }
  } catch (err: any) {
    context.log.error("Error in notes function:", err);
    context.res.status = 500;
    context.res.body = { error: "Internal server error" };
  }
};
