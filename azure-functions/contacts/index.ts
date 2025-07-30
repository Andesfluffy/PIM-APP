import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.DATABASE_NAME || "pim";
const client = new MongoClient(uri);

async function getCollection() {
  if (!client.topology) {
    await client.connect();
  }
  return client.db(dbName).collection("contacts");
}

module.exports = async function (context: any, req: any) {
  context.log("Contacts function processed a request.");

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
          const contact = await collection.findOne({ _id: new ObjectId(id) });
          if (contact) {
            context.res.status = 200;
            context.res.body = contact;
          } else {
            context.res.status = 404;
            context.res.body = { error: "Contact not found" };
          }
        } else {
          const contacts = await collection
            .find()
            .sort({ lastName: 1, firstName: 1 })
            .toArray();
          context.res.status = 200;
          context.res.body = contacts;
        }
        break;
      case "POST":
        const newContact = {
          firstName: req.body?.firstName,
          lastName: req.body?.lastName,
          email: req.body?.email,
          phone: req.body?.phone,
          company: req.body?.company,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const inserted = await collection.insertOne(newContact);
        const created = await collection.findOne({ _id: inserted.insertedId });
        context.res.status = 201;
        context.res.body = created;
        break;
      case "PUT":
        if (!id) {
          context.res.status = 400;
          context.res.body = { error: "Contact ID is required" };
          break;
        }
        const update: any = {
          firstName: req.body?.firstName,
          lastName: req.body?.lastName,
          email: req.body?.email,
          phone: req.body?.phone,
          company: req.body?.company,
          updatedAt: new Date(),
        };
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
          context.res.body = { error: "Contact not found" };
        } else {
          context.res.status = 200;
          context.res.body = updated.value;
        }
        break;
      case "DELETE":
        if (!id) {
          context.res.status = 400;
          context.res.body = { error: "Contact ID is required" };
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
    context.log.error("Error in contacts function:", err);
    context.res.status = 500;
    context.res.body = { error: "Internal server error" };
  }
};
