import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderId, orderAmount, customerName, customerEmail, customerPhone } = body

        const cashfreeOrderData = {
            order_id: orderId,
            order_amount: orderAmount,
            order_currency: 'INR',
            customer_details: {
                customer_id: customerEmail,
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
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error in create-order:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
