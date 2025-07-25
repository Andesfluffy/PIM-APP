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
    const collection = await getCollection("contacts");
    const contactId = req.params.id;
    const method = req.method.toUpperCase();

    switch (method) {
      case "GET":
        if (contactId) {
          // Get single contact
          const contact = await collection.findOne({
            _id: new ObjectId(contactId),
          });
          if (!contact) {
            return createResponse(404, null, "Contact not found");
          }
          return createResponse(200, contact);
        } else {
          // Get all contacts with optional filtering and pagination
          const {
            page = 1,
            limit = 10,
            search,
            group,
            sortBy = "lastName",
            sortOrder = "asc",
          } = req.query;

          let query = {};
          if (search) {
            query.$or = [
              { firstName: { $regex: search, $options: "i" } },
              { lastName: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { company: { $regex: search, $options: "i" } },
            ];
          }
          if (group) {
            query.group = group;
          }

          const skip = (parseInt(page) - 1) * parseInt(limit);
          const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

          const contacts = await collection
            .find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

          const total = await collection.countDocuments(query);

          return createResponse(200, {
            contacts,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total,
              pages: Math.ceil(total / parseInt(limit)),
            },
          });
        }

      case "POST":
        // Create new contact
        const newContact = req.body;
        validateRequired(newContact, ["firstName", "lastName"]);

        // Validate email format if provided
        if (
          newContact.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email)
        ) {
          return createResponse(400, null, "Invalid email format");
        }

        // Check for duplicate email
        if (newContact.email) {
          const existingContact = await collection.findOne({
            email: newContact.email,
          });
          if (existingContact) {
            return createResponse(
              409,
              null,
              "Contact with this email already exists"
            );
          }
        }

        const contactToInsert = {
          firstName: newContact.firstName,
          lastName: newContact.lastName,
          email: newContact.email || "",
          phone: newContact.phone || "",
          company: newContact.company || "",
          jobTitle: newContact.jobTitle || "",
          address: newContact.address || "",
          notes: newContact.notes || "",
          group: newContact.group || "general",
          tags: newContact.tags || [],
          isFavorite: newContact.isFavorite || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const insertResult = await collection.insertOne(contactToInsert);
        const createdContact = await collection.findOne({
          _id: insertResult.insertedId,
        });

        return createResponse(201, createdContact);

      case "PUT":
        // Update existing contact
        if (!contactId) {
          return createResponse(400, null, "Contact ID is required for update");
        }

        const updateData = req.body;
        delete updateData._id; // Remove _id from update data

        // Validate email format if provided
        if (
          updateData.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)
        ) {
          return createResponse(400, null, "Invalid email format");
        }

        // Check for duplicate email (excluding current contact)
        if (updateData.email) {
          const existingContact = await collection.findOne({
            email: updateData.email,
            _id: { $ne: new ObjectId(contactId) },
          });
          if (existingContact) {
            return createResponse(
              409,
              null,
              "Another contact with this email already exists"
            );
          }
        }

        const updatedContact = {
          ...updateData,
          updatedAt: new Date(),
        };

        const updateResult = await collection.findOneAndUpdate(
          { _id: new ObjectId(contactId) },
          { $set: updatedContact },
          { returnDocument: "after" }
        );

        if (!updateResult.value) {
          return createResponse(404, null, "Contact not found");
        }

        return createResponse(200, updateResult.value);

      case "DELETE":
        // Delete contact
        if (!contactId) {
          return createResponse(
            400,
            null,
            "Contact ID is required for deletion"
          );
        }

        const deleteResult = await collection.deleteOne({
          _id: new ObjectId(contactId),
        });

        if (deleteResult.deletedCount === 0) {
          return createResponse(404, null, "Contact not found");
        }

        return createResponse(200, {
          message: "Contact deleted successfully",
          id: contactId,
        });

      default:
        return createResponse(405, null, `Method ${method} not allowed`);
    }
  } catch (error) {
    console.error("Contacts function error:", error);
    return createResponse(500, null, error);
  }
};
