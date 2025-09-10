export const metadata = {
  title: 'Split Bill API Documentation',
  description: 'Interactive API documentation and reference with live testing capabilities for the Split Bill API',
  keywords: ['API', 'documentation', 'Split Bill', 'swagger', 'OpenAPI'],
  openGraph: {
    title: 'Split Bill API Documentation',
    description: 'Interactive API documentation and reference with live testing capabilities',
  },
}

export default function DocsLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div>
        {children}
      </div>
    )
  }