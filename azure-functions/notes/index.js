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
    const collection = await getCollection("notes");
    const noteId = req.params.id;
    const method = req.method.toUpperCase();

    switch (method) {
      case "GET":
        if (noteId) {
          // Get single note
          const note = await collection.findOne({ _id: new ObjectId(noteId) });
          if (!note) {
            return createResponse(404, null, "Note not found");
          }
          return createResponse(200, note);
        } else {
          // Get all notes with optional filtering and pagination
          const {
            page = 1,
            limit = 10,
            search,
            category,
            sortBy = "createdAt",
            sortOrder = "desc",
          } = req.query;

          let query = {};
          if (search) {
            query.$or = [
              { title: { $regex: search, $options: "i" } },
              { content: { $regex: search, $options: "i" } },
            ];
          }
          if (category) {
            query.category = category;
          }

          const skip = (parseInt(page) - 1) * parseInt(limit);
          const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

          const notes = await collection
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

          const total = await collection.countDocuments(query);

          return createResponse(200, {
            notes,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total,
              pages: Math.ceil(total / parseInt(limit)),
            },
          });
        }

      case "POST":
        // Create new note
        const newNote = req.body;
        validateRequired(newNote, ["title", "content"]);

        const noteToInsert = {
          ...newNote,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: newNote.category || "general",
          tags: newNote.tags || [],
          isPinned: newNote.isPinned || false,
        };

        const insertResult = await collection.insertOne(noteToInsert);
        const createdNote = await collection.findOne({
          _id: insertResult.insertedId,
        });

        return createResponse(201, createdNote);

      case "PUT":
        // Update existing note
        if (!noteId) {
          return createResponse(400, null, "Note ID is required for update");
        }

        const updateData = req.body;
        delete updateData._id; // Remove _id from update data

        const updatedNote = {
          ...updateData,
          updatedAt: new Date(),
        };

        const updateResult = await collection.findOneAndUpdate(
          { _id: new ObjectId(noteId) },
          { $set: updatedNote },
          { returnDocument: "after" }
        );

        if (!updateResult.value) {
          return createResponse(404, null, "Note not found");
        }

        return createResponse(200, updateResult.value);

      case "DELETE":
        // Delete note
        if (!noteId) {
          return createResponse(400, null, "Note ID is required for deletion");
        }

        const deleteResult = await collection.deleteOne({
          _id: new ObjectId(noteId),
        });

        if (deleteResult.deletedCount === 0) {
          return createResponse(404, null, "Note not found");
        }

        return createResponse(200, {
          message: "Note deleted successfully",
          id: noteId,
        });

      default:
        return createResponse(405, null, `Method ${method} not allowed`);
    }
  } catch (error) {
    console.error("Notes function error:", error);
    return createResponse(500, null, error);
  }
};
