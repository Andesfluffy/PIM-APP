// // scripts/setup-cosmos.ts
// import { CosmosClient, IndexingPolicy } from "@azure/cosmos";

// const endpoint = process.env.COSMOS_DB_ENDPOINT!;
// const key = process.env.COSMOS_DB_KEY!;

// const client = new CosmosClient({ endpoint, key });

// async function setupDatabase() {
//   try {
//     console.log("Setting up Cosmos DB...");

//     // Create database
//     const { database } = await client.databases.createIfNotExists({
//       id: "nexus-pim",
//     });
//     console.log("✅ Database created/verified");

//     // Create containers
//     const containers = [
//       {
//         id: "notes",
//         partitionKey: "/userId",
//         indexingPolicy: {
//           includedPaths: [{ path: "/*" }],
//           excludedPaths: [
//             { path: "/content/*" }, // Exclude content from indexing for performance
//           ],
//           compositeIndexes: [
//             [
//               { path: "/userId", order: "ascending" as const },
//               { path: "/updatedAt", order: "descending" as const },
//             ],
//           ],
//         } as IndexingPolicy,
//       },
//       {
//         id: "tasks",
//         partitionKey: "/userId",
//         indexingPolicy: {
//           includedPaths: [{ path: "/*" }],
//           compositeIndexes: [
//             [
//               { path: "/userId", order: "ascending" as const },
//               { path: "/priority", order: "ascending" as const },
//               { path: "/dueDate", order: "ascending" as const },
//             ],
//             [
//               { path: "/userId", order: "ascending" as const },
//               { path: "/status", order: "ascending" as const },
//               { path: "/updatedAt", order: "descending" as const },
//             ],
//           ],
//         } as IndexingPolicy,
//       },
//       {
//         id: "contacts",
//         partitionKey: "/userId",
//         indexingPolicy: {
//           includedPaths: [{ path: "/*" }],
//           compositeIndexes: [
//             [
//               { path: "/userId", order: "ascending" as const },
//               { path: "/lastName", order: "ascending" as const },
//               { path: "/firstName", order: "ascending" as const },
//             ],
//             [
//               { path: "/userId", order: "ascending" as const },
//               { path: "/isFavorite", order: "descending" as const },
//               { path: "/lastName", order: "ascending" as const },
//             ],
//           ],
//         } as IndexingPolicy,
//       },
//     ];

//     for (const containerConfig of containers) {
//       const { container } = await database.containers.createIfNotExists({
//         id: containerConfig.id,
//         partitionKey: containerConfig.partitionKey,
//         indexingPolicy: containerConfig.indexingPolicy,
//       });
//       console.log(`✅ Container '${containerConfig.id}' created/verified`);
//     }

//     console.log("🎉 Cosmos DB setup completed successfully!");
//   } catch (error) {
//     console.error("❌ Error setting up Cosmos DB:", error);
//     process.exit(1);
//   }
// }

// setupDatabase();
// scripts/setup-cosmos.js
import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;

if (!endpoint || !key) {
  console.error(
    "❌ Please set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables"
  );
  process.exit(1);
}

const client = new CosmosClient({ endpoint, key });

async function setupDatabase() {
  try {
    console.log("Setting up Cosmos DB...");
    console.log(`Endpoint: ${endpoint}`);

    // Create database
    const { database } = await client.databases.createIfNotExists({
      id: "nexus-pim",
    });
    console.log('✅ Database "nexus-pim" created/verified');

    // Create containers with optimized indexing
    const containers = [
      {
        id: "notes",
        partitionKey: "/userId",
        indexingPolicy: {
          includedPaths: [{ path: "/*" }],
          excludedPaths: [
            { path: "/content/*" }, // Exclude content from indexing for performance
          ],
          compositeIndexes: [
            [
              { path: "/userId", order: "ascending" },
              { path: "/updatedAt", order: "descending" },
            ],
          ],
        },
      },
      {
        id: "tasks",
        partitionKey: "/userId",
        indexingPolicy: {
          includedPaths: [{ path: "/*" }],
          compositeIndexes: [
            [
              { path: "/userId", order: "ascending" },
              { path: "/priority", order: "ascending" },
              { path: "/dueDate", order: "ascending" },
            ],
            [
              { path: "/userId", order: "ascending" },
              { path: "/status", order: "ascending" },
              { path: "/updatedAt", order: "descending" },
            ],
          ],
        },
      },
      {
        id: "contacts",
        partitionKey: "/userId",
        indexingPolicy: {
          includedPaths: [{ path: "/*" }],
          compositeIndexes: [
            [
              { path: "/userId", order: "ascending" },
              { path: "/lastName", order: "ascending" },
              { path: "/firstName", order: "ascending" },
            ],
            [
              { path: "/userId", order: "ascending" },
              { path: "/isFavorite", order: "descending" },
              { path: "/lastName", order: "ascending" },
            ],
          ],
        },
      },
    ];

    for (const containerConfig of containers) {
      try {
        const { container } = await database.containers.createIfNotExists({
          id: containerConfig.id,
          partitionKey: containerConfig.partitionKey,
          indexingPolicy: containerConfig.indexingPolicy,
        });
        console.log(`✅ Container '${containerConfig.id}' created/verified`);
      } catch (error) {
        console.log(
          `⚠️  Container '${containerConfig.id}' - trying without composite indexes...`
        );
        // Fallback: create without composite indexes if they're not supported
        const { container } = await database.containers.createIfNotExists({
          id: containerConfig.id,
          partitionKey: containerConfig.partitionKey,
        });
        console.log(
          `✅ Container '${containerConfig.id}' created/verified (basic indexing)`
        );
      }
    }

    console.log("🎉 Cosmos DB setup completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Update your local.settings.json with these values");
    console.log('2. Run "npm start" to start your Functions locally');
    console.log("3. Test the endpoints with your frontend application");
  } catch (error) {
    console.error("❌ Error setting up Cosmos DB:", error);
    if (error.code === 401) {
      console.error("💡 Check your Cosmos DB key and endpoint URL");
    } else if (error.code === "ENOTFOUND") {
      console.error("💡 Check your internet connection and endpoint URL");
    }
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
