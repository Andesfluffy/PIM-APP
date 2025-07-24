import { handleSignOut } from "@/app/actions/auth";

export async function GET() {
  return handleSignOut();
}
