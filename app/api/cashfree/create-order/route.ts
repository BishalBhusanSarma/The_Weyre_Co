import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderId, orderAmount, customerName, customerEmail, customerPhone } = body

        console.log('Creating Cashfree order with:', { orderId, orderAmount, customerName, customerEmail, customerPhone })

        // Validate order amount
        if (!orderAmount || orderAmount <= 0) {
            return NextResponse.json({
                error: 'Invalid order amount',
                message: 'Order amount must be greater than 0'
            }, { status: 400 })
        }

        // Cashfree sandbox has a maximum limit of ₹5000
        // For production, this limit is much higher
        const MAX_SANDBOX_AMOUNT = 5000
        if (orderAmount > MAX_SANDBOX_AMOUNT) {
            return NextResponse.json({
                error: 'Order amount exceeds limit',
                message: `Sandbox mode has a maximum limit of ₹${MAX_SANDBOX_AMOUNT}. Your order amount is ₹${orderAmount}. Please use production mode for higher amounts.`,
                details: {
                    orderAmount,
                    maxAmount: MAX_SANDBOX_AMOUNT,
                    suggestion: 'Switch to production mode or reduce order amount for testing'
                }
            }, { status: 400 })
        }

        // Round to 2 decimal places to avoid precision issues
        const roundedAmount = Math.round(orderAmount * 100) / 100

        // Generate alphanumeric customer ID from email (remove special chars except underscore and hyphen)
        const customerId = customerEmail.replace(/[^a-zA-Z0-9_-]/g, '_')

        const cashfreeOrderData = {
            order_id: orderId,
            order_amount: roundedAmount,
            order_currency: 'INR',
            customer_details: {
                customer_id: customerId,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?order_id=${orderId}`,
                notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/cashfree/webhook`,
            },
        }

        const response = await fetch('https://sandbox.cashfree.com/pg/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID || '',
                'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
                'x-api-version': '2023-08-01',
            },
            body: JSON.stringify(cashfreeOrderData),
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Cashfree API Error:', error)
            console.error('Request data:', cashfreeOrderData)
            return NextResponse.json({
                error: 'Failed to create order',
                details: error,
                message: error.message || 'Unknown error from Cashfree'
            }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Error in create-order:', error)
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message || error.toString()
        }, { status: 500 })
    }
}
