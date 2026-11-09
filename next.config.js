/** @type {import('next').NextConfig} */
module.exports = {
  output: "standalone", // small self-contained build, used by Docker
  experimental: {
    staleTimes: { dynamic: 0 }, // the browser never reuses an old copy of a page
  },
};
