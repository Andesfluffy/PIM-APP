"use server";

import { signIn, signOut } from "@logto/next/server-actions";
import { logtoConfig } from "@/logtoConfig";

export async function handleSignIn() {
  return signIn(logtoConfig, "http://localhost:3000/api/logto/callback");
}

export async function handleSignOut() {
  return signOut(logtoConfig);
}
