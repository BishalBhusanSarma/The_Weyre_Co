export function ProductCardSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '40%' }} />
                <div className="h-6 bg-gray-200 rounded animate-pulse" style={{ width: '80%' }} />
                <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: '50%' }} />
            </div>
        </div>
    )
}

export function ProductDetailSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '30%' }} />
                <div className="h-10 bg-gray-200 rounded animate-pulse" style={{ width: '80%' }} />
                <div className="h-12 bg-gray-200 rounded animate-pulse" style={{ width: '40%' }} />
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '70%' }} />
                </div>
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    )
}

export function CarouselSkeleton() {
    return (
        <div className="bg-black py-20">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 gap-12 items-center h-96">
                    <div className="h-full bg-gray-800 rounded-2xl animate-pulse" />
                    <div className="space-y-6">
                        <div className="h-6 bg-gray-800 rounded animate-pulse" style={{ width: '30%' }} />
                        <div className="h-16 bg-gray-800 rounded animate-pulse" style={{ width: '80%' }} />
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                        <div className="h-4 bg-gray-800 rounded animate-pulse" style={{ width: '70%' }} />
                        <div className="h-12 bg-gray-800 rounded animate-pulse" style={{ width: '40%' }} />
                    </div>
                </div>
            </div>
        </div>
    )
}
