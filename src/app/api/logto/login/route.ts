// app/api/logto/sign-in/route.ts
import { handleSignIn } from "@/app/actions/auth";

export async function GET() {
  return handleSignIn();
}
