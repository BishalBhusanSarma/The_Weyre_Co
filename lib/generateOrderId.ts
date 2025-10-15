// Generate custom order ID in format: TWC-{random alphanumeric}
export function generateOrderId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let randomStr = ''

    // Generate 12 character random string
    for (let i = 0; i < 12; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return `TWC-${randomStr}`
}
