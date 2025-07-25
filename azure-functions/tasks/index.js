const {
  getCollection,
  createResponse,
  validateRequired,
  sanitizeId,
} = require("../../shared/database");
const { ObjectId } = require("mongodb");

module.exports = async function (context, req) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return createResponse(200, null);
  }

  try {
    const collection = await getCollection("tasks");
    const taskId = req.params.id;
    const method = req.method.toUpperCase();

    switch (method) {
      case "GET":
        if (taskId) {
          // Get single task
          const task = await collection.findOne({ _id: new ObjectId(taskId) });
          if (!task) {
            return createResponse(404, null, "Task not found");
          }
          return createResponse(200, task);
        } else {
          // Get all tasks with optional filtering and pagination
          const {
            page = 1,
            limit = 10,
            search,
            status,
            priority,
            category,
            dueDateFrom,
            dueDateTo,
            sortBy = "createdAt",
            sortOrder = "desc",
          } = req.query;

          let query = {};

          if (search) {
            query.$or = [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
            ];
          }

          if (status) {
            query.status = status;
          }

          if (priority) {
            query.priority = priority;
          }

          if (category) {
            query.category = category;
          }

          // Date range filtering
          if (dueDateFrom || dueDateTo) {
            query.dueDate = {};
            if (dueDateFrom) {
              query.dueDate.$gte = new Date(dueDateFrom);
            }
            if (dueDateTo) {
              query.dueDate.$lte = new Date(dueDateTo);
            }
          }

          const skip = (parseInt(page) - 1) * parseInt(limit);
          const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

          const tasks = await collection
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

          const total = await collection.countDocuments(query);

          return createResponse(200, {
            tasks,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total,
              pages: Math.ceil(total / parseInt(limit)),
            },
          });
        }

      case "POST":
        // Create new task
        const newTask = req.body;
        validateRequired(newTask, ["title"]);

        // Validate status
        const validStatuses = ["todo", "in-progress", "completed", "cancelled"];
        if (newTask.status && !validStatuses.includes(newTask.status)) {
          return createResponse(
            400,
            null,
            `Invalid status. Must be one of: ${validStatuses.join(", ")}`
          );
        }

        // Validate priority
        const validPriorities = ["low", "medium", "high", "urgent"];
        if (newTask.priority && !validPriorities.includes(newTask.priority)) {
          return createResponse(
            400,
            null,
            `Invalid priority. Must be one of: ${validPriorities.join(", ")}`
          );
        }

        const taskToInsert = {
          title: newTask.title,
          description: newTask.description || "",
          status: newTask.status || "todo",
          priority: newTask.priority || "medium",
          category: newTask.category || "general",
          dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
          tags: newTask.tags || [],
          assignee: newTask.assignee || "",
          estimatedHours: newTask.estimatedHours || null,
          actualHours: newTask.actualHours || null,
          progress: newTask.progress || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
        };

        const insertResult = await collection.insertOne(taskToInsert);
        const createdTask = await collection.findOne({
          _id: insertResult.insertedId,
        });

        return createResponse(201, createdTask);

      case "PUT":
        // Update existing task
        if (!taskId) {
          return createResponse(400, null, "Task ID is required for update");
        }

        const updateData = req.body;
        delete updateData._id; // Remove _id from update data

        // Validate status
        const validUpdateStatuses = [
          "todo",
          "in-progress",
          "completed",
          "cancelled",
        ];
        if (
          updateData.status &&
          !validUpdateStatuses.includes(updateData.status)
        ) {
          return createResponse(
            400,
            null,
            `Invalid status. Must be one of: ${validUpdateStatuses.join(", ")}`
          );
        }

        // Validate priority
        const validUpdatePriorities = ["low", "medium", "high", "urgent"];
        if (
          updateData.priority &&
          !validUpdatePriorities.includes(updateData.priority)
        ) {
          return createResponse(
            400,
            null,
            `Invalid priority. Must be one of: ${validUpdatePriorities.join(
              ", "
            )}`
          );
        }

        const updatedTask = {
          ...updateData,
          updatedAt: new Date(),
        };

        // Set completedAt when status changes to completed
        if (updateData.status === "completed") {
          updatedTask.completedAt = new Date();
          updatedTask.progress = 100;
        } else if (updateData.status && updateData.status !== "completed") {
          updatedTask.completedAt = null;
        }

        // Convert dueDate to Date object if provided
        if (updateData.dueDate) {
          updatedTask.dueDate = new Date(updateData.dueDate);
        }

        const updateResult = await collection.findOneAndUpdate(
          { _id: new ObjectId(taskId) },
          { $set: updatedTask },
          { returnDocument: "after" }
        );

        if (!updateResult.value) {
          return createResponse(404, null, "Task not found");
        }

        return createResponse(200, updateResult.value);

      case "DELETE":
        // Delete task
        if (!taskId) {
          return createResponse(400, null, "Task ID is required for deletion");
        }

        const deleteResult = await collection.deleteOne({
          _id: new ObjectId(taskId),
        });

        if (deleteResult.deletedCount === 0) {
          return createResponse(404, null, "Task not found");
        }

        return createResponse(200, {
          message: "Task deleted successfully",
          id: taskId,
        });

      default:
        return createResponse(405, null, `Method ${method} not allowed`);
    }
  } catch (error) {
    console.error("Tasks function error:", error);
    return createResponse(500, null, error);
  }
};
