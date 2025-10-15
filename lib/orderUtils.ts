// Order utility functions

export function generateOrderId(): string {
    const now = new Date()

    // Format: YYYYMMDD
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const date = `${year}${month}${day}`

    // Random 5-digit number
    const random = String(Math.floor(10000 + Math.random() * 90000))

    // Format: HHMMSS
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const time = `${hours}${minutes}${seconds}`

    // TWC-20241014-12345-143022
    return `TWC-${date}-${random}-${time}`
}

export function canCancelOrder(order: any): boolean {
    if (order.delivery_status !== 'pending' || order.payment_status !== 'paid') {
        return false
    }

    const orderTime = new Date(order.created_at)
    const now = new Date()
    const hoursSinceOrder = (now.getTime() - orderTime.getTime()) / (1000 * 60 * 60)

    return hoursSinceOrder <= 3
}

export function getTimeRemaining(order: any): string {
    if (order.delivery_status !== 'pending') return ''

    const orderTime = new Date(order.created_at)
    const now = new Date()
    const hoursSinceOrder = (now.getTime() - orderTime.getTime()) / (1000 * 60 * 60)
    const hoursRemaining = Math.max(0, 3 - hoursSinceOrder)

    if (hoursRemaining === 0) return ''

    const hours = Math.floor(hoursRemaining)
    const minutes = Math.floor((hoursRemaining - hours) * 60)

    return `${hours}h ${minutes}m remaining to cancel`
}
