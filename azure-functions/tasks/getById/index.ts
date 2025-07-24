
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Task from "../../lib/models/Task";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const id = context.bindingData.id;
  const doc = await Task.findById(id);
  if (!doc) {
    context.res = {
      status: 404,
      body: { error: "Task not found" }
    };
    return;
  }
  context.res = {
    status: 200,
    body: doc
  };
};
export default httpTrigger;
