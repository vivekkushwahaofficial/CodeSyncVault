import { defineConfig } from "wxt";

const isChromeWebStoreBuild = process.env.CODEVAULT_STORE_BUILD === "true";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],

  manifest: {
    name: "CodeSyncVault",

    short_name: "CodeSyncVault",

    version: "1.4.1",

    description: "Automatically detect, organize, and sync your accepted coding solutions from LeetCode, GeeksforGeeks, and HackerRank to GitHub.",

    ...(isChromeWebStoreBuild
      ? {}
      : {
          // Stable extension ID for development builds
          key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvaLlfmE+X4kGdZNCsyBJLuN6XPzAGlfCW4hsUbUCYQahqtofVpy/vOCjuwP5uLdtHoip7JanTbgcCvmD5HlmMRUojL2cy6302Kl+7YrmPdQcqZhNxu+KWfemuzJ4yx+ohY+Sz9abSda0ZGvCF6bYFHR0j4c3h3AAUYkJOmLrVHF8qa52O6YbsN/51oCsiwVBgYaiu9/JRHHIbpRD20VJHgmy8EfRUjxuTtUJsDenDWKX+eLpAG8MVt/osKxWf/en1LkEKmDM7/9K6Q0LJUJ6gVkAiicDk111sBtlOkRhZ3+XU0MV/seU+263drvFkM38I6897eadc6L3wUUsZuCD1QIDAQAB",
        }),
    action: {
      default_title: "CodeSyncVault",
    },

    permissions: ["identity", "storage"],

    host_permissions: [
      "https://github.com/*",
      "https://api.github.com/*",
      "https://codevault-backend-me91.onrender.com/*",
    ],

    icons: {
      "16": "/icons/icon16.png",
      "32": "/icons/icon32.png",
      "48": "/icons/icon48.png",
      "96": "/icons/icon96.png",
      "128": "/icons/icon128.png",
    },

    web_accessible_resources: [
      {
        resources: ["leetcode-main-world.js"],
        matches: ["*://leetcode.com/*", "*://*.leetcode.com/*"],
      },
      {
        resources: ["gfg-page-bridge.js"],
        matches: ["*://geeksforgeeks.org/*", "*://*.geeksforgeeks.org/*"],
      },
      {
        resources: ["hackerrank-main-world.js"],
        matches: ["*://hackerrank.com/*", "*://*.hackerrank.com/*"],
      },
    ],
  },
});
