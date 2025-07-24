
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Note from "../../lib/models/Note";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const id = context.bindingData.id;

  const note = await Note.findById(id);
  if (!note) {
    context.res = {
      status: 404,
      body: { error: "Note not found" }
    };
    return;
  }

  context.res = {
    status: 200,
    body: note
  };
};

export default httpTrigger;
