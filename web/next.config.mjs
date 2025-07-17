// @ts-check
 
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   /* config options here */
// }
 
// module.exports = {
//   allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
// }
export default {
  allowedDevOrigins: ['http://13.201.67.2:3000'], 
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
}