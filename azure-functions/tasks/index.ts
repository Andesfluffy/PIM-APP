import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.DATABASE_NAME || "pim-db";
const client = new MongoClient(uri);

async function getCollection() {
  if (!client.topology) {
    await client.connect();
  }
  return client.db(dbName).collection("tasks");
}

module.exports = async function (context: any, req: any) {
  context.log("Tasks function processed a request.");

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
          const task = await collection.findOne({ _id: new ObjectId(id) });
          if (task) {
            context.res.status = 200;
            context.res.body = task;
          } else {
            context.res.status = 404;
            context.res.body = { error: "Task not found" };
          }
        } else {
          const filter: any = {};
          if (req.query.status) filter.status = req.query.status;
          if (req.query.priority) filter.priority = req.query.priority;
          const tasks = await collection
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();
          context.res.status = 200;
          context.res.body = tasks;
        }
        break;
      case "POST":
        const newTask = {
          title: req.body?.title || "Untitled Task",
          description: req.body?.description || "",
          status: req.body?.status || "pending",
          priority: req.body?.priority || "medium",
          dueDate: req.body?.dueDate || null,
          tags: req.body?.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
        };
        const insert = await collection.insertOne(newTask);
        const created = await collection.findOne({ _id: insert.insertedId });
        context.res.status = 201;
        context.res.body = created;
        break;
      case "PUT":
        if (!id) {
          context.res.status = 400;
          context.res.body = { error: "Task ID is required" };
          break;
        }
        const update: any = {
          title: req.body?.title,
          description: req.body?.description,
          status: req.body?.status,
          priority: req.body?.priority,
          dueDate: req.body?.dueDate,
          tags: req.body?.tags,
          updatedAt: new Date(),
        };
        if (req.body?.status === "completed") {
          update.completedAt = new Date();
        } else if (req.body?.status) {
          update.completedAt = null;
        }
        Object.keys(update).forEach(
          (k) => update[k] === undefined && delete update[k]
        );
        const updated = await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: update },
          { returnDocument: "after" }
        );
        if (!updated.value) {
          context.res.status = 404;
          context.res.body = { error: "Task not found" };
        } else {
          context.res.status = 200;
          context.res.body = updated.value;
        }
        break;
      case "DELETE":
        if (!id) {
          context.res.status = 400;
          context.res.body = { error: "Task ID is required" };
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
    context.log.error("Error in tasks function:", err);
    context.res.status = 500;
    context.res.body = { error: "Internal server error" };
  }
};
