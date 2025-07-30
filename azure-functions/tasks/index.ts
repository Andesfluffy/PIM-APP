// tasks/index.js - HTTP-triggered Azure Function for Tasks CRUD
const { CosmosClient } = require("@azure/cosmos");

// Initialize Cosmos DB client
const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const database = client.database(process.env.DATABASE_NAME || "spa-database");
const container = database.container("tasks");

module.exports = async function (context, req) {
  context.log("Tasks function processed a request.");

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
    const taskId = req.params.id;

    switch (method) {
      case "GET":
        if (taskId) {
          // Get single task
          const { resource: task } = await container.item(taskId).read();
          if (task) {
            context.res = {
              ...context.res,
              status: 200,
              body: task,
            };
          } else {
            context.res = {
              ...context.res,
              status: 404,
              body: { error: "Task not found" },
            };
          }
        } else {
          // Get all tasks with optional filtering
          const status = req.query.status;
          const priority = req.query.priority;

          let querySpec = {
            query: "SELECT * FROM c ORDER BY c.createdAt DESC",
          };

          if (status) {
            querySpec = {
              query:
                "SELECT * FROM c WHERE c.status = @status ORDER BY c.createdAt DESC",
              parameters: [{ name: "@status", value: status }],
            };
          }

          if (priority) {
            querySpec = {
              query:
                "SELECT * FROM c WHERE c.priority = @priority ORDER BY c.createdAt DESC",
              parameters: [{ name: "@priority", value: priority }],
            };
          }

          if (status && priority) {
            querySpec = {
              query:
                "SELECT * FROM c WHERE c.status = @status AND c.priority = @priority ORDER BY c.createdAt DESC",
              parameters: [
                { name: "@status", value: status },
                { name: "@priority", value: priority },
              ],
            };
          }

          const { resources: tasks } = await container.items
            .query(querySpec)
            .fetchAll();
          context.res = {
            ...context.res,
            status: 200,
            body: tasks,
          };
        }
        break;

      case "POST":
        // Create new task
        const newTask = {
          id: generateId(),
          title: req.body.title || "Untitled Task",
          description: req.body.description || "",
          status: req.body.status || "pending", // pending, in-progress, completed
          priority: req.body.priority || "medium", // low, medium, high
          dueDate: req.body.dueDate || null,
          tags: req.body.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
        };

        const { resource: createdTask } = await container.items.create(newTask);
        context.res = {
          ...context.res,
          status: 201,
          body: createdTask,
        };
        break;

      case "PUT":
        // Update existing task
        if (!taskId) {
          context.res = {
            ...context.res,
            status: 400,
            body: { error: "Task ID is required for update" },
          };
          return;
        }

        const updateData = {
          title: req.body.title,
          description: req.body.description,
          status: req.body.status,
          priority: req.body.priority,
          dueDate: req.body.dueDate,
          tags: req.body.tags,
          updatedAt: new Date().toISOString(),
        };

        // Handle completion status
        if (
          req.body.status === "completed" &&
          updateData.completedAt === undefined
        ) {
          updateData.completedAt = new Date().toISOString();
        } else if (req.body.status !== "completed") {
          updateData.completedAt = null;
        }

        // Remove undefined fields
        Object.keys(updateData).forEach(
          (key) => updateData[key] === undefined && delete updateData[key]
        );

        const { resource: existingTask } = await container.item(taskId).read();
        if (!existingTask) {
          context.res = {
            ...context.res,
            status: 404,
            body: { error: "Task not found" },
          };
          return;
        }

        const updatedTask = { ...existingTask, ...updateData };
        const { resource: result } = await container
          .item(taskId)
          .replace(updatedTask);

        context.res = {
          ...context.res,
          status: 200,
          body: result,
        };
        break;

      case "DELETE":
        // Delete task
        if (!taskId) {
          context.res = {
            ...context.res,
            status: 400,
            body: { error: "Task ID is required for deletion" },
          };
          return;
        }

        await container.item(taskId).delete();
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
    context.log.error("Error in tasks function:", error);
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
