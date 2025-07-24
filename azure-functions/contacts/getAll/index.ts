
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Contact from "../../lib/models/Contact";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const userId = req.query.userId;
  const docs = await Contact.find({ userId });
  context.res = {
    status: 200,
    body: docs
  };
};
export default httpTrigger;
