// notes/index.js - HTTP-triggered Azure Function for Notes CRUD
const { CosmosClient } = require("@azure/cosmos");

// Initialize Cosmos DB client
const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const database = client.database(process.env.DATABASE_NAME || "spa-database");
const container = database.container("notes");

module.exports = async function (context, req) {
  context.log("Notes function processed a request.");

  // Set CORS headers
  context.res = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  };

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    context.res.status = 200;
    return;
  }

  try {
    const method = req.method;
    const noteId = req.params.id;

    switch (method) {
      case "GET":
        if (noteId) {
          // Get single note
          const { resource: note } = await container.item(noteId).read();
          if (note) {
            context.res = {
              ...context.res,
              status: 200,
              body: note,
            };
          } else {
            context.res = {
              ...context.res,
              status: 404,
              body: { error: "Note not found" },
            };
          }
        } else {
          // Get all notes
          const querySpec = {
            query: "SELECT * FROM c ORDER BY c.createdAt DESC",
          };
          const { resources: notes } = await container.items
            .query(querySpec)
            .fetchAll();
          context.res = {
            ...context.res,
            status: 200,
            body: notes,
          };
        }
        break;

      case "POST":
        // Create new note
        const newNote = {
          id: generateId(),
          title: req.body.title || "Untitled Note",
          content: req.body.content || "",
          tags: req.body.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const { resource: createdNote } = await container.items.create(newNote);
        context.res = {
          ...context.res,
          status: 201,
          body: createdNote,
        };
        break;

      case "PUT":
        // Update existing note
        if (!noteId) {
          context.res = {
            ...context.res,
            status: 400,
            body: { error: "Note ID is required for update" },
          };
          return;
        }

        const updateData = {
          title: req.body.title,
          content: req.body.content,
          tags: req.body.tags,
          updatedAt: new Date().toISOString(),
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(
          (key) => updateData[key] === undefined && delete updateData[key]
        );

        const { resource: existingNote } = await container.item(noteId).read();
        if (!existingNote) {
          context.res = {
            ...context.res,
            status: 404,
            body: { error: "Note not found" },
          };
          return;
        }

        const updatedNote = { ...existingNote, ...updateData };
        const { resource: result } = await container
          .item(noteId)
          .replace(updatedNote);

        context.res = {
          ...context.res,
          status: 200,
          body: result,
        };
        break;

      case "DELETE":
        // Delete note
        if (!noteId) {
          context.res = {
            ...context.res,
            status: 400,
            body: { error: "Note ID is required for deletion" },
          };
          return;
        }

        await container.item(noteId).delete();
        context.res = {
          ...context.res,
          status: 204,
          body: null,
        };
        break;

      default:
        context.res = {
          ...context.res,
          status: 405,
          body: { error: "Method not allowed" },
        };
    }
  } catch (error) {
    context.log.error("Error in notes function:", error);
    context.res = {
      ...context.res,
      status: 500,
      body: {
        error: "Internal server error",
        details: error.message,
      },
    };
  }
};

// Helper function to generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
