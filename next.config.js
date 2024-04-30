/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://127.0.0.1:5000/api/:path*'
          : '/api/',
      },
    ]
  },
  // logging: {
  //   fetches: {
  //     fullUrl: true
  //   }
  // }
};

export default config;
