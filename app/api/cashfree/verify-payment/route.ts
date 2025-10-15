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
            // Get order details to find user_id
            const { data: order } = await supabase
                .from('orders')
                .select('user_id')
                .eq('order_id', orderId)
                .single()

            // Update order status
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    payment_status: 'paid',
                    updated_at: new Date().toISOString()
                })
                .eq('order_id', orderId)

            if (updateError) {
                console.error('Error updating order:', updateError)
            } else {
                console.log('Order payment status updated to paid:', orderId)

                // Clear cart after successful payment
                if (order?.user_id) {
                    await supabase
                        .from('cart')
                        .delete()
                        .eq('user_id', order.user_id)
                    console.log('Cart cleared for user:', order.user_id)
                }
            }
        }

        return NextResponse.json(paymentData)
    } catch (error) {
        console.error('Error verifying payment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
