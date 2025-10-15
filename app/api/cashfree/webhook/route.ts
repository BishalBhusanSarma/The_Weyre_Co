import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Cashfree webhook payload
        const { type, data } = body

        if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
            const { order } = data

            // Update order payment status
            await supabase
                .from('orders')
                .update({
                    payment_status: 'paid',
                    payment_id: order.cf_order_id,
                    cashfree_order_id: order.cf_order_id,
                })
                .eq('id', order.order_id)

            // Record transaction
            await supabase
                .from('payment_transactions')
                .insert({
                    order_id: order.order_id,
                    amount: order.order_amount,
                    payment_status: 'paid',
                    payment_id: order.cf_order_id,
                    cashfree_order_id: order.cf_order_id,
                    cashfree_payment_id: order.payment?.cf_payment_id,
                    transaction_data: data,
                })
        } else if (type === 'PAYMENT_FAILED_WEBHOOK') {
            const { order } = data

            await supabase
                .from('orders')
                .update({
                    payment_status: 'failed',
                })
                .eq('id', order.order_id)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
