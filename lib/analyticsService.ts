import { supabase } from './supabase'

// TypeScript Interfaces
export interface DateRange {
    startDate: string // ISO format
    endDate: string // ISO format
    month?: number
    year?: number
}

export interface DashboardStats {
    totalRevenue: number
    totalReturns: number
    netSales: number
    totalDeliveryCharges: number
    totalRTOCosts: number
    netProfit: number
    orderCount: number
    returnCount: number
    rtoCount: number
}

export interface Order {
    id: string
    order_id: string
    user_id: string
    total: number
    delivery_charge: number
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    delivery_status: string
    return_refund_status: 'none' | 'requested' | 'approved' | 'rejected' | 'rto'
    created_at: string
    updated_at: string
    coupon_code?: string
    coupon_discount?: number
    users?: {
        email: string
        name: string
    } | null
    order_items?: OrderItem[]
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    quantity: number
    price: number
    products?: {
        name: string
    }
}

/**
 * Fetch orders with all necessary details for analytics
 * Includes user information (handles deleted users) and order items
 */
export async function fetchOrdersWithDetails(dateRange?: DateRange): Promise<Order[]> {
    try {
        let query = supabase
            .from('orders')
            .select(`
        *,
        users (
          email,
          name
        ),
        order_items (
          *,
          products (
            name
          )
        )
      `)
            .order('created_at', { ascending: false })

        // Apply date range filter if provided
        if (dateRange) {
            query = query
                .gte('created_at', dateRange.startDate)
                .lte('created_at', dateRange.endDate)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching orders:', error)
            throw error
        }

        return (data as Order[]) || []
    } catch (error) {
        console.error('Error in fetchOrdersWithDetails:', error)
        return []
    }
}

/**
 * Calculate total delivery charges from paid orders
 */
export function calculateDeliveryCharges(orders: Order[]): number {
    return orders
        .filter(order => order.payment_status === 'paid')
        .reduce((total, order) => total + (order.delivery_charge || 0), 0)
}

/**
 * Calculate RTO costs (₹80 per return/refund order)
 * RTO = Return to Origin, deducted from customer refund and counted as business cost
 */
export function calculateRTOCosts(orders: Order[]): number {
    return orders
        .filter(order => order.delivery_status === 'return_refund')
        .reduce((total, order) => total + 80, 0) // ₹80 RTO charge per refund
}

/**
 * Calculate total returns (refunded orders)
 * Returns the full order amount (RTO charge is tracked separately)
 */
export function calculateReturns(orders: Order[]): number {
    return orders
        .filter(order => order.delivery_status === 'return_refund' && order.payment_status === 'refunded')
        .reduce((total, order) => total + (order.total || 0), 0)
}

/**
 * Calculate all statistics for the dashboard
 */
export async function calculateStatistics(dateRange?: DateRange): Promise<DashboardStats> {
    try {
        const orders = await fetchOrdersWithDetails(dateRange)

        // Total Revenue: Sum of all paid orders
        const totalRevenue = orders
            .filter(order => order.payment_status === 'paid')
            .reduce((total, order) => total + (order.total || 0), 0)

        // Total Returns: Sum of approved refunds
        const totalReturns = calculateReturns(orders)

        // Net Sales: Revenue - Returns
        const netSales = totalRevenue - totalReturns

        // Total Delivery Charges
        const totalDeliveryCharges = calculateDeliveryCharges(orders)

        // Total RTO Costs (delivery × 2)
        const totalRTOCosts = calculateRTOCosts(orders)

        // Net Profit: Net Sales - Delivery Charges - RTO Costs
        const netProfit = netSales - totalDeliveryCharges - totalRTOCosts

        // Order Count: Total paid orders
        const orderCount = orders.filter(order => order.payment_status === 'paid').length

        // Return Count: Total refunded orders
        const returnCount = orders.filter(order => order.delivery_status === 'return_refund').length

        // RTO Count: Same as return count (all returns incur RTO charge)
        const rtoCount = returnCount

        return {
            totalRevenue: Number(totalRevenue.toFixed(2)),
            totalReturns: Number(totalReturns.toFixed(2)),
            netSales: Number(netSales.toFixed(2)),
            totalDeliveryCharges: Number(totalDeliveryCharges.toFixed(2)),
            totalRTOCosts: Number(totalRTOCosts.toFixed(2)),
            netProfit: Number(netProfit.toFixed(2)),
            orderCount,
            returnCount,
            rtoCount
        }
    } catch (error) {
        console.error('Error calculating statistics:', error)
        // Return zero values on error
        return {
            totalRevenue: 0,
            totalReturns: 0,
            netSales: 0,
            totalDeliveryCharges: 0,
            totalRTOCosts: 0,
            netProfit: 0,
            orderCount: 0,
            returnCount: 0,
            rtoCount: 0
        }
    }
}

/**
 * Get date range for a specific month and year
 */
export function getMonthDateRange(month: number, year: number): DateRange {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        month,
        year
    }
}

/**
 * Format currency with ₹ symbol and comma separators
 */
export function formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format number with comma separators
 */
export function formatNumber(num: number): string {
    return num.toLocaleString('en-IN')
}
