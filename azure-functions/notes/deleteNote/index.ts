
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Note from "../../lib/models/Note";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const id = context.bindingData.id;

  await Note.findByIdAndDelete(id);
  context.res = {
    status: 204,
    body: null
  };
};

export default httpTrigger;
