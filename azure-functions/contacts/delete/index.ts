
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { connectToDatabase } from "../../lib/db";
import Contact from "../../lib/models/Contact";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToDatabase();
  const id = context.bindingData.id;
  await Contact.findByIdAndDelete(id);
  context.res = {
    status: 204,
    body: null
  };
};
export default httpTrigger;
