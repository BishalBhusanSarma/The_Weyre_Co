import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const orderId = searchParams.get('orderId')

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
        }

        // Verify payment with Cashfree
        const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID || '',
                'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
                'x-api-version': '2023-08-01',
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
        }

        const paymentData = await response.json()

        // Update order in database
        if (paymentData.order_status === 'PAID') {
            await supabase
                .from('orders')
                .update({
                    payment_status: 'paid',
                    payment_id: paymentData.cf_order_id,
                    cashfree_order_id: paymentData.cf_order_id,
                })
                .eq('id', orderId)

            // Record transaction
            await supabase
                .from('payment_transactions')
                .insert({
                    order_id: orderId,
                    amount: paymentData.order_amount,
                    payment_status: 'paid',
                    payment_id: paymentData.cf_order_id,
                    cashfree_order_id: paymentData.cf_order_id,
                    transaction_data: paymentData,
                })
        }

        return NextResponse.json(paymentData)
    } catch (error) {
        console.error('Error verifying payment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
