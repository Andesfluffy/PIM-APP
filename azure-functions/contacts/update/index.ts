
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Contact from "../../lib/models/Contact";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const id = context.bindingData.id;
  const updated = await Contact.findByIdAndUpdate(id, req.body, { new: true });
  context.res = {
    status: 200,
    body: updated
  };
};
export default httpTrigger;
