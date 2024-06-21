/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        instrumentationHook: true,
        reactCompiler: true,
    },
}

export default nextConfig
