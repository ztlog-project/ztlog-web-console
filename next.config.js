/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/admin/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_TARGET || 'http://localhost:8089'}/admin/api/v1/:path*`
      }
    ]
  }
}

export default nextConfig
