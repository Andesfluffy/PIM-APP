
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Note from "../../lib/models/Note";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const id = context.bindingData.id;
  const { text } = req.body;

  const updated = await Note.findByIdAndUpdate(id, { text }, { new: true });
  context.res = {
    status: 200,
    body: updated
  };
};

export default httpTrigger;
