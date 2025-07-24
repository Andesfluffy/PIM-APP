import { LogtoNextConfig } from "@logto/next";

export const logtoConfig: LogtoNextConfig = {
  appId: process.env.LOGTO_APP_ID || "your-application-id",

  appSecret: process.env.LOGTO_APP_SECRET || "your-app-secret",

  endpoint: process.env.LOGTO_ENDPOINT || "https://your-tenant.logto.app",

  baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",

  cookieSecret:
    process.env.LOGTO_COOKIE_SECRET ||
    "6da9e4d1c5c90e8205f1c45bf98d637a45957ead2a9f02971859dd3138d776af",

  cookieSecure: process.env.NODE_ENV === "production",
};
