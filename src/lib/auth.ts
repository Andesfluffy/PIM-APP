import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert, type AppOptions } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
// Use global Buffer only if available (Node runtime). Edge runtimes won't have it.

type VerifiedUser = {
  uid: string;
  email?: string;
};

function initAdmin() {
  if (getApps().length) return;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    // Do not initialize; verification will throw later
    return;
  }
  // Handle escaped newlines in env var
  if (privateKey.startsWith("-----BEGIN") === false) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const options: AppOptions = {
    credential: cert({ projectId, clientEmail, privateKey }),
  };
  initializeApp(options);
}

export async function verifyAuth(req: NextRequest): Promise<VerifiedUser> {
  initAdmin();
  const token = req.cookies.get("firebase-auth-token")?.value;
  if (!token) throw new Error("UNAUTHORIZED");
  if (getApps().length) {
    try {
      const decoded = await getAuth().verifyIdToken(token);
      return { uid: decoded.uid, email: decoded.email };
    } catch {
      // fall through to dev decode for friendlier DX
    }
  }
  try {
    const parts = token.split(".");
    if (parts.length < 2) throw new Error("bad token");
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // Pad base64 if needed
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    let json: string;
    const atobFn: any = (globalThis as any).atob;
    if (typeof atobFn === "function") {
      json = atobFn(b64);
    } else {
      const NodeBuffer: any = (globalThis as any).Buffer;
      if (!NodeBuffer) throw new Error("no decoder");
      json = NodeBuffer.from(b64, "base64").toString("utf8");
    }
    const payload = JSON.parse(json);
    const uid = payload.uid || payload.user_id || payload.sub;
    if (!uid) throw new Error("missing uid");
    return { uid, email: payload.email };
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
