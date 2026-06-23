import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode — static build for Firebase Hosting (no Node server in production)
  ssr: false,
} satisfies Config;
