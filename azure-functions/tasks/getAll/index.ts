
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Task from "../../lib/models/Task";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const userId = req.query.userId;
  const docs = await Task.find({ userId });
  context.res = {
    status: 200,
    body: docs
  };
};
export default httpTrigger;
