import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-black text-white mt-12 md:mt-20">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">The Weyre Co.</h3>
                        <p className="text-gray-400 text-sm md:text-base">Luxury jewellery for every occasion</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Shop</h4>
                        <Link href="/products" className="block text-gray-400 hover:text-white mb-2 text-sm md:text-base">All Products</Link>
                        <Link href="/products/men" className="block text-gray-400 hover:text-white mb-2 text-sm md:text-base">Men</Link>
                        <Link href="/products/women" className="block text-gray-400 hover:text-white mb-2 text-sm md:text-base">Women</Link>
                    </div>
                    <div>
                        <h4 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Company</h4>
                        <Link href="/about" className="block text-gray-400 hover:text-white mb-2 text-sm md:text-base">About Us</Link>
                        <Link href="/privacy" className="block text-gray-400 hover:text-white mb-2 text-sm md:text-base">Privacy Policy</Link>
                    </div>
                    <div>
                        <h4 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Contact</h4>
                        <p className="text-gray-400 text-sm md:text-base break-all">support@weyreco.com</p>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400">
                    <p className="text-xs md:text-sm">&copy; 2024 The Weyre Co. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
