
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Note from "../../lib/models/Note";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const userId = req.query.userId;

  if (!userId) {
    context.res = {
      status: 400,
      body: { error: "Missing userId" }
    };
    return;
  }

  const notes = await Note.find({ userId });
  context.res = {
    status: 200,
    body: notes
  };
};

export default httpTrigger;
