interface LogtoNextConfig {
  endpoint: string;
  appId: string;
  appSecret: string;
  baseUrl: string;
  cookieSecret: string;
  cookieSecure: boolean;
}

export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT!,
  appId: process.env.LOGTO_APP_ID!,
  appSecret: process.env.LOGTO_APP_SECRET!,
  baseUrl: process.env.LOGTO_BASE_URL!,
  cookieSecret: process.env.LOGTO_COOKIE_SECRET!,
  cookieSecure: process.env.NODE_ENV === "production",
};
