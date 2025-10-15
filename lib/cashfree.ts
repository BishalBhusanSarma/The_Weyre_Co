// Cashfree Payment Gateway Integration
import { Cashfree } from 'cashfree-pg-sdk-javascript'

// Initialize Cashfree
export const initializeCashfree = () => {
    const mode = process.env.NODE_ENV === 'production' ? 'PROD' : 'TEST'
    Cashfree.XClientId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID || ''
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || ''
    Cashfree.XEnvironment = mode === 'PROD' ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX
}

// Create Cashfree Order
export const createCashfreeOrder = async (orderData: {
    orderId: string
    orderAmount: number
    customerName: string
    customerEmail: string
    customerPhone: string
}) => {
    try {
        const response = await fetch('/api/cashfree/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        })

        if (!response.ok) {
            throw new Error('Failed to create Cashfree order')
        }

        return await response.json()
    } catch (error) {
        console.error('Error creating Cashfree order:', error)
        throw error
    }
}

// Verify Payment
export const verifyPayment = async (orderId: string) => {
    try {
        const response = await fetch(`/api/cashfree/verify-payment?orderId=${orderId}`)

        if (!response.ok) {
            throw new Error('Failed to verify payment')
        }

        return await response.json()
    } catch (error) {
        console.error('Error verifying payment:', error)
        throw error
    }
}
