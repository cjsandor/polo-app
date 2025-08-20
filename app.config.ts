import "dotenv/config";

// Environment validation
const validateEnvVars = () => {
  const required = [
    "EXPO_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing required environment variables: ${missing.join(", ")}\n` +
        `   Please copy .env.example to .env.local and fill in your Supabase credentials.`,
    );
  }
};

validateEnvVars();

const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || "development";
const isProduction = environment === "production";

export default {
  expo: {
    name: process.env.EXPO_PUBLIC_APP_NAME || "Polo Match Tracker",
    slug: "polo-match-tracker",
    scheme: "polotracker",
    version: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: [
      "**/*",
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.polomatchtracker",
    },
    android: {
      package: "com.yourcompany.polomatchtracker",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    runtimeVersion: { policy: "sdkVersion" },
    updates: {
      url: isProduction ? "https://u.expo.dev/your-project-id" : undefined,
    },
    extra: {
      // Supabase configuration
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,

      // App configuration
      environment,
      isProduction,
      appName: process.env.EXPO_PUBLIC_APP_NAME || "Polo Match Tracker",
      version: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",

      // EAS configuration
      eas: {
        projectId: process.env.EAS_PROJECT_ID || "",
      },
    },
  },
};
