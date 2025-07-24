
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Task from "../../lib/models/Task";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const id = context.bindingData.id;
  await Task.findByIdAndDelete(id);
  context.res = {
    status: 204,
    body: null
  };
};
export default httpTrigger;
