
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Contact from "../../lib/models/Contact";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const id = context.bindingData.id;
  const doc = await Contact.findById(id);
  if (!doc) {
    context.res = {
      status: 404,
      body: { error: "Contact not found" }
    };
    return;
  }
  context.res = {
    status: 200,
    body: doc
  };
};
export default httpTrigger;
