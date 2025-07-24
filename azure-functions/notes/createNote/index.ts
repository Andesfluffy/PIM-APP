
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Note from "../../lib/models/Note";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const { userId, text } = req.body;

  if (!userId || !text) {
    context.res = {
      status: 400,
      body: { error: "Missing userId or text" }
    };
    return;
  }

  const note = await Note.create({ userId, text });
  context.res = {
    status: 201,
    body: note
  };
};

export default httpTrigger;
