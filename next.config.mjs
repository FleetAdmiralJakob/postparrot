/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
    cacheOnFrontEndNav: true,
    swSrc: "src/app/sw.ts",
    swDest: "public/sw.js",
});

/** @type {import("next").NextConfig} */
const config = {
    images: {
        domains: ["img.clerk.com"],
        remotePatterns: [{
            hostname: "img.clerk.com"
        }]
    },
    reactStrictMode: true
};

export default withSerwist(config);
