import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'The Weyre Co. Shop - Luxury Jewellery',
    description: 'Premium Jewellery shopping experience',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
