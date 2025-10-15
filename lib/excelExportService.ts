import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import {
    DashboardStats,
    Order,
    fetchOrdersWithDetails,
    getMonthDateRange,
    calculateStatistics
} from './analyticsService'

/**
 * Create Summary Sheet with overview statistics
 */
function createSummarySheet(stats: DashboardStats, month: number, year: number): XLSX.WorkSheet {
    const monthName = format(new Date(year, month - 1), 'MMMM yyyy')

    const data = [
        [`Financial Summary - ${monthName}`],
        [],
        ['Metric', 'Amount'],
        ['Total Revenue', `₹${stats.totalRevenue.toFixed(2)}`],
        ['Total Returns', `₹${stats.totalReturns.toFixed(2)}`],
        ['Net Sales', `₹${stats.netSales.toFixed(2)}`],
        ['Delivery Charges', `₹${stats.totalDeliveryCharges.toFixed(2)}`],
        ['RTO Costs', `₹${stats.totalRTOCosts.toFixed(2)}`],
        ['Net Profit', `₹${stats.netProfit.toFixed(2)}`],
        [],
        ['Order Statistics', 'Count'],
        ['Total Orders', stats.orderCount],
        ['Total Returns', stats.returnCount],
        ['Total RTO Orders', stats.rtoCount],
        [],
        ['Profit Margin', `${stats.netSales > 0 ? ((stats.netProfit / stats.netSales) * 100).toFixed(2) : 0}%`]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(data)

    // Set column widths
    worksheet['!cols'] = [
        { wch: 25 },
        { wch: 20 }
    ]

    return worksheet
}

/**
 * Create Orders Sheet with detailed order list
 */
function createOrdersSheet(orders: Order[]): XLSX.WorkSheet {
    const paidOrders = orders.filter(order => order.payment_status === 'paid')

    const data = [
        ['Order ID', 'Date', 'Customer Email', 'Customer Name', 'Amount', 'Delivery Charge', 'Payment Status', 'Delivery Status', 'Return Status']
    ]

    paidOrders.forEach(order => {
        data.push([
            order.order_id || order.id.substring(0, 8),
            format(new Date(order.created_at), 'dd/MM/yyyy HH:mm'),
            order.users?.email || '[Deleted User]',
            order.users?.name || '[Deleted User]',
            `₹${order.total.toFixed(2)}`,
            `₹${(order.delivery_charge || 0).toFixed(2)}`,
            order.payment_status,
            order.delivery_status,
            order.return_refund_status
        ])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(data)

    // Set column widths
    worksheet['!cols'] = [
        { wch: 20 }, // Order ID
        { wch: 18 }, // Date
        { wch: 30 }, // Email
        { wch: 25 }, // Name
        { wch: 15 }, // Amount
        { wch: 15 }, // Delivery
        { wch: 15 }, // Payment Status
        { wch: 15 }, // Delivery Status
        { wch: 15 }  // Return Status
    ]

    return worksheet
}

/**
 * Create Returns Sheet with return details
 */
function createReturnsSheet(orders: Order[]): XLSX.WorkSheet {
    const returnOrders = orders.filter(order => order.return_refund_status === 'approved')

    const data = [
        ['Order ID', 'Date', 'Customer Email', 'Customer Name', 'Return Amount', 'Delivery Charge', 'Return Status', 'Refund Status']
    ]

    returnOrders.forEach(order => {
        data.push([
            order.order_id || order.id.substring(0, 8),
            format(new Date(order.created_at), 'dd/MM/yyyy HH:mm'),
            order.users?.email || '[Deleted User]',
            order.users?.name || '[Deleted User]',
            `₹${order.total.toFixed(2)}`,
            `₹${(order.delivery_charge || 0).toFixed(2)}`,
            order.return_refund_status,
            order.payment_status
        ])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(data)

    // Set column widths
    worksheet['!cols'] = [
        { wch: 20 }, // Order ID
        { wch: 18 }, // Date
        { wch: 30 }, // Email
        { wch: 25 }, // Name
        { wch: 15 }, // Amount
        { wch: 15 }, // Delivery
        { wch: 15 }, // Return Status
        { wch: 15 }  // Refund Status
    ]

    return worksheet
}

/**
 * Create RTO Sheet with RTO order details
 */
function createRTOSheet(orders: Order[]): XLSX.WorkSheet {
    const rtoOrders = orders.filter(order => order.return_refund_status === 'rto')

    const data = [
        ['Order ID', 'Date', 'Customer Email', 'Customer Name', 'Order Amount', 'Delivery Charge', 'RTO Cost (Delivery × 2)', 'Total Loss']
    ]

    rtoOrders.forEach(order => {
        const deliveryCharge = order.delivery_charge || 0
        const rtoCost = deliveryCharge * 2
        const totalLoss = order.total + rtoCost

        data.push([
            order.order_id || order.id.substring(0, 8),
            format(new Date(order.created_at), 'dd/MM/yyyy HH:mm'),
            order.users?.email || '[Deleted User]',
            order.users?.name || '[Deleted User]',
            `₹${order.total.toFixed(2)}`,
            `₹${deliveryCharge.toFixed(2)}`,
            `₹${rtoCost.toFixed(2)}`,
            `₹${totalLoss.toFixed(2)}`
        ])
    })

    const worksheet = XLSX.utils.aoa_to_sheet(data)

    // Set column widths
    worksheet['!cols'] = [
        { wch: 20 }, // Order ID
        { wch: 18 }, // Date
        { wch: 30 }, // Email
        { wch: 25 }, // Name
        { wch: 15 }, // Amount
        { wch: 15 }, // Delivery
        { wch: 20 }, // RTO Cost
        { wch: 15 }  // Total Loss
    ]

    return worksheet
}

/**
 * Generate complete monthly Excel report
 */
export async function generateMonthlyReport(month: number, year: number): Promise<Blob> {
    try {
        // Get date range for the month
        const dateRange = getMonthDateRange(month, year)

        // Fetch data
        const [stats, orders] = await Promise.all([
            calculateStatistics(dateRange),
            fetchOrdersWithDetails(dateRange)
        ])

        // Create workbook
        const workbook = XLSX.utils.book_new()

        // Add sheets
        const summarySheet = createSummarySheet(stats, month, year)
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

        const ordersSheet = createOrdersSheet(orders)
        XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders')

        const returnsSheet = createReturnsSheet(orders)
        XLSX.utils.book_append_sheet(workbook, returnsSheet, 'Returns')

        const rtoSheet = createRTOSheet(orders)
        XLSX.utils.book_append_sheet(workbook, rtoSheet, 'RTO Orders')

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

        return blob
    } catch (error) {
        console.error('Error generating Excel report:', error)
        throw new Error('Failed to generate Excel report')
    }
}

/**
 * Download Excel file to user's computer
 */
export function downloadExcel(blob: Blob, filename: string): void {
    try {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Error downloading Excel file:', error)
        throw new Error('Failed to download Excel file')
    }
}

/**
 * Generate and download monthly report
 */
export async function downloadMonthlyReport(month: number, year: number): Promise<void> {
    try {
        const monthName = format(new Date(year, month - 1), 'MMMM')
        const filename = `Financial_Report_${monthName}_${year}.xlsx`

        const blob = await generateMonthlyReport(month, year)
        downloadExcel(blob, filename)
    } catch (error) {
        console.error('Error in downloadMonthlyReport:', error)
        throw error
    }
}
