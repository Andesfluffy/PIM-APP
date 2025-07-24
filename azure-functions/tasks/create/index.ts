
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Task from "../../lib/models/Task";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const body = req.body;
  const doc = await Task.create(body);
  context.res = {
    status: 201,
    body: doc
  };
};
export default httpTrigger;
