// src/functions/contacts.ts
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

// Cosmos DB configuration
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT!,
  key: process.env.COSMOS_DB_KEY!,
});

const database = cosmosClient.database("nexus-pim");
const contactsContainer = database.container("contacts");

// Contact interface
interface Contact {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  tags: string[];
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

// Helper function to validate user authentication
function getUserIdFromHeaders(request: HttpRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return payload.sub || payload.userId;
  } catch {
    return null;
  }
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// GET /api/contacts - Get all contacts for a user
export async function getContacts(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = getUserIdFromHeaders(request);
    if (!userId) {
      return { status: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    const searchTerm = request.query.get("search") || "";
    const company = request.query.get("company");
    const isFavorite = request.query.get("favorite") === "true";

    let query =
      "SELECT * FROM c WHERE c.userId = @userId AND (c.isDeleted = false OR IS_NULL(c.isDeleted))";
    const parameters = [{ name: "@userId", value: userId }];

    if (searchTerm) {
      query +=
        " AND (CONTAINS(LOWER(c.firstName), LOWER(@search)) OR CONTAINS(LOWER(c.lastName), LOWER(@search)) OR CONTAINS(LOWER(c.email), LOWER(@search)) OR CONTAINS(LOWER(c.company), LOWER(@search)))";
      parameters.push({ name: "@search", value: searchTerm });
    }

    if (company) {
      query += " AND CONTAINS(LOWER(c.company), LOWER(@company))";
      parameters.push({ name: "@company", value: company });
    }

    if (isFavorite) {
      query += " AND c.isFavorite = true";
    }

    // Order by favorites first, then alphabetically by last name, then first name
    query += " ORDER BY c.isFavorite DESC, c.lastName ASC, c.firstName ASC";

    const { resources: contacts } = await contactsContainer.items
      .query({ query, parameters })
      .fetchAll();

    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contacts),
    };
  } catch (error) {
    context.error("Error fetching contacts:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}

// POST /api/contacts - Create a new contact
export async function createContact(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = getUserIdFromHeaders(request);
    if (!userId) {
      return { status: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    const body = (await request.json()) as Partial<Contact>;

    if (!body.firstName || !body.lastName) {
      return {
        status: 400,
        body: JSON.stringify({
          error: "First name and last name are required",
        }),
      };
    }

    // Validate email if provided
    if (body.email && !isValidEmail(body.email)) {
      return {
        status: 400,
        body: JSON.stringify({ error: "Invalid email format" }),
      };
    }

    // Check for duplicate email within the user's contacts
    if (body.email) {
      const duplicateQuery =
        "SELECT * FROM c WHERE c.userId = @userId AND LOWER(c.email) = LOWER(@email) AND (c.isDeleted = false OR IS_NULL(c.isDeleted))";
      const { resources: duplicates } = await contactsContainer.items
        .query({
          query: duplicateQuery,
          parameters: [
            { name: "@userId", value: userId },
            { name: "@email", value: body.email },
          ],
        })
        .fetchAll();

      if (duplicates.length > 0) {
        return {
          status: 409,
          body: JSON.stringify({
            error: "Contact with this email already exists",
          }),
        };
      }
    }

    const now = new Date().toISOString();
    const contact: Contact = {
      id: crypto.randomUUID(),
      userId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      company: body.company,
      jobTitle: body.jobTitle,
      address: body.address,
      notes: body.notes,
      tags: body.tags || [],
      socialMedia: body.socialMedia,
      isFavorite: body.isFavorite || false,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    const { resource: createdContact } = await contactsContainer.items.create(
      contact
    );

    return {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createdContact),
    };
  } catch (error) {
    context.error("Error creating contact:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}

// PUT /api/contacts/{id} - Update a contact
export async function updateContact(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = getUserIdFromHeaders(request);
    if (!userId) {
      return { status: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    const contactId = request.params.id;
    if (!contactId) {
      return {
        status: 400,
        body: JSON.stringify({ error: "Contact ID is required" }),
      };
    }

    const body = (await request.json()) as Partial<Contact>;

    try {
      const { resource: existingContact } = await contactsContainer
        .item(contactId, userId)
        .read<Contact>();

      if (
        !existingContact ||
        existingContact.userId !== userId ||
        existingContact.isDeleted
      ) {
        return {
          status: 404,
          body: JSON.stringify({ error: "Contact not found" }),
        };
      }

      // Validate email if provided
      if (body.email && !isValidEmail(body.email)) {
        return {
          status: 400,
          body: JSON.stringify({ error: "Invalid email format" }),
        };
      }

      // Check for duplicate email (excluding current contact)
      if (body.email && body.email !== existingContact.email) {
        const duplicateQuery =
          "SELECT * FROM c WHERE c.userId = @userId AND LOWER(c.email) = LOWER(@email) AND c.id != @contactId AND (c.isDeleted = false OR IS_NULL(c.isDeleted))";
        const { resources: duplicates } = await contactsContainer.items
          .query({
            query: duplicateQuery,
            parameters: [
              { name: "@userId", value: userId },
              { name: "@email", value: body.email },
              { name: "@contactId", value: contactId },
            ],
          })
          .fetchAll();

        if (duplicates.length > 0) {
          return {
            status: 409,
            body: JSON.stringify({
              error: "Contact with this email already exists",
            }),
          };
        }
      }

      const updatedContact: Contact = {
        ...existingContact,
        firstName: body.firstName || existingContact.firstName,
        lastName: body.lastName || existingContact.lastName,
        email: body.email !== undefined ? body.email : existingContact.email,
        phone: body.phone !== undefined ? body.phone : existingContact.phone,
        company:
          body.company !== undefined ? body.company : existingContact.company,
        jobTitle:
          body.jobTitle !== undefined
            ? body.jobTitle
            : existingContact.jobTitle,
        address: body.address || existingContact.address,
        notes: body.notes !== undefined ? body.notes : existingContact.notes,
        tags: body.tags || existingContact.tags,
        socialMedia: body.socialMedia || existingContact.socialMedia,
        isFavorite:
          body.isFavorite !== undefined
            ? body.isFavorite
            : existingContact.isFavorite,
        updatedAt: new Date().toISOString(),
      };

      const { resource: result } = await contactsContainer
        .item(contactId, userId)
        .replace(updatedContact);

      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      };
    } catch (error) {
      return {
        status: 404,
        body: JSON.stringify({ error: "Contact not found" }),
      };
    }
  } catch (error) {
    context.error("Error updating contact:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}

// DELETE /api/contacts/{id} - Delete a contact (soft delete)
export async function deleteContact(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = getUserIdFromHeaders(request);
    if (!userId) {
      return { status: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    const contactId = request.params.id;
    if (!contactId) {
      return {
        status: 400,
        body: JSON.stringify({ error: "Contact ID is required" }),
      };
    }

    try {
      const { resource: existingContact } = await contactsContainer
        .item(contactId, userId)
        .read<Contact>();

      if (
        !existingContact ||
        existingContact.userId !== userId ||
        existingContact.isDeleted
      ) {
        return {
          status: 404,
          body: JSON.stringify({ error: "Contact not found" }),
        };
      }

      const deletedContact: Contact = {
        ...existingContact,
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      };

      await contactsContainer.item(contactId, userId).replace(deletedContact);

      return { status: 204 };
    } catch (error) {
      return {
        status: 404,
        body: JSON.stringify({ error: "Contact not found" }),
      };
    }
  } catch (error) {
    context.error("Error deleting contact:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}

// GET /api/contacts/companies - Get unique companies
export async function getCompanies(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = getUserIdFromHeaders(request);
    if (!userId) {
      return { status: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    const query = `
      SELECT DISTINCT VALUE c.company 
      FROM c 
      WHERE c.userId = @userId 
        AND c.company != null 
        AND c.company != "" 
        AND (c.isDeleted = false OR IS_NULL(c.isDeleted))
      ORDER BY c.company
    `;

    const { resources: companies } = await contactsContainer.items
      .query({
        query,
        parameters: [{ name: "@userId", value: userId }],
      })
      .fetchAll();

    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companies),
    };
  } catch (error) {
    context.error("Error fetching companies:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}

// PATCH /api/contacts/{id}/favorite - Toggle favorite status
export async function toggleFavorite(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = getUserIdFromHeaders(request);
    if (!userId) {
      return { status: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    const contactId = request.params.id;
    if (!contactId) {
      return {
        status: 400,
        body: JSON.stringify({ error: "Contact ID is required" }),
      };
    }

    try {
      const { resource: existingContact } = await contactsContainer
        .item(contactId, userId)
        .read<Contact>();

      if (
        !existingContact ||
        existingContact.userId !== userId ||
        existingContact.isDeleted
      ) {
        return {
          status: 404,
          body: JSON.stringify({ error: "Contact not found" }),
        };
      }

      const updatedContact: Contact = {
        ...existingContact,
        isFavorite: !existingContact.isFavorite,
        updatedAt: new Date().toISOString(),
      };

      const { resource: result } = await contactsContainer
        .item(contactId, userId)
        .replace(updatedContact);

      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      };
    } catch (error) {
      return {
        status: 404,
        body: JSON.stringify({ error: "Contact not found" }),
      };
    }
  } catch (error) {
    context.error("Error toggling favorite:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}

// Register HTTP triggers
app.http("contacts-get", {
  methods: ["GET"],
  route: "contacts",
  authLevel: "anonymous",
  handler: getContacts,
});

app.http("contacts-create", {
  methods: ["POST"],
  route: "contacts",
  authLevel: "anonymous",
  handler: createContact,
});

app.http("contacts-update", {
  methods: ["PUT"],
  route: "contacts/{id}",
  authLevel: "anonymous",
  handler: updateContact,
});

app.http("contacts-delete", {
  methods: ["DELETE"],
  route: "contacts/{id}",
  authLevel: "anonymous",
  handler: deleteContact,
});

app.http("contacts-companies", {
  methods: ["GET"],
  route: "contacts/companies",
  authLevel: "anonymous",
  handler: getCompanies,
});

app.http("contacts-toggle-favorite", {
  methods: ["PATCH"],
  route: "contacts/{id}/favorite",
  authLevel: "anonymous",
  handler: toggleFavorite,
});
