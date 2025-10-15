'use client'
import Image from 'next/image'

interface InvoiceProps {
    order: any
    user: any
    isAdmin?: boolean
}

export default function Invoice({ order, user, isAdmin = false }: InvoiceProps) {
    const handlePrint = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const productDiscount = order.actual_total ? (order.actual_total - order.total - (order.coupon_discount || 0)) : 0

        // Generate the HTML content
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.order_id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            padding: 20px;
            background: white;
        }
        
        .invoice {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid black;
        }
        
        .header-left h1 {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .header-left p {
            font-size: 14px;
            color: #555;
            margin: 5px 0;
        }
        
        .header-right {
            text-align: right;
        }
        
        .logo {
            width: 96px;
            height: 64px;
            margin-bottom: 10px;
        }
        
        .header-right h2 {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .header-right p {
            font-size: 12px;
            color: #666;
        }
        
        .bill-to {
            margin-bottom: 30px;
        }
        
        .bill-to h3 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .bill-to .name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .bill-to .address {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 3px;
        }
        
        .bill-to p {
            font-size: 14px;
            color: #555;
            margin: 3px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        thead {
            background: black;
            color: white;
        }
        
        th {
            padding: 12px;
            text-align: left;
            font-size: 14px;
            font-weight: bold;
        }
        
        th:nth-child(2),
        td:nth-child(2) {
            text-align: center;
        }
        
        th:nth-child(3),
        th:nth-child(4),
        td:nth-child(3),
        td:nth-child(4) {
            text-align: right;
        }
        
        tbody tr:nth-child(even) {
            background: #f5f5f5;
        }
        
        td {
            padding: 10px 12px;
            font-size: 14px;
            border-bottom: 1px solid #ddd;
        }
        
        .summary {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }
        
        .summary-content {
            width: 350px;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
        }
        
        .summary-row.coupon {
            background: #f0fdf4;
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 4px;
            font-weight: bold;
            color: #16a34a;
        }
        
        .summary-row.savings {
            border-top: 1px solid #ddd;
            margin-top: 5px;
            padding-top: 10px;
            font-weight: bold;
            color: #16a34a;
        }
        
        .summary-row.total {
            border-top: 3px solid black;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 20px;
            font-weight: bold;
        }
        
        .status {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .status-item p:first-child {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .status-item p:last-child {
            font-size: 14px;
            font-weight: bold;
        }
        
        .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 3px solid black;
        }
        
        .footer-logo {
            width: 96px;
            height: 64px;
            margin: 0 auto 15px;
        }
        
        .footer p {
            font-size: 14px;
            margin: 5px 0;
        }
        
        .footer .thank-you {
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .footer .contact {
            color: #666;
        }
        
        .footer .note {
            font-size: 11px;
            color: #999;
            margin-top: 15px;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .invoice {
                padding: 20px;
            }
            
            @page {
                size: A4;
                margin: 15mm;
            }
        }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div class="header-left">
                <h1>INVOICE</h1>
                <p style="font-family: monospace;">Order ID: ${order.order_id}</p>
                <p>Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
            </div>
            <div class="header-right">
                <img src="/logo.png" alt="The Weyre Co." class="logo" />
                <h2>The Weyre Co.</h2>
                <p>Luxury Jewellery</p>
            </div>
        </div>
        
        <div class="bill-to">
            <h3>Bill To:</h3>
            <p class="name">${user.name}</p>
            <p class="address">${user.address}</p>
            <p class="address">${user.city}, ${user.state} ${user.zipcode}</p>
            <p>Email: ${user.email}</p>
            <p>Phone: ${user.phone}</p>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.order_items.map((item: any) => `
                    <tr>
                        <td>${item.products?.name || 'Product'}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.price.toFixed(2)}</td>
                        <td><strong>₹${(item.quantity * item.price).toFixed(2)}</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="summary">
            <div class="summary-content">
                ${order.actual_total && productDiscount > 0 ? `
                    <div class="summary-row">
                        <span>Original Price:</span>
                        <span style="text-decoration: line-through;">₹${order.actual_total.toFixed(2)}</span>
                    </div>
                    <div class="summary-row" style="color: #16a34a; font-weight: 600;">
                        <span>Product Discount:</span>
                        <span>-₹${productDiscount.toFixed(2)}</span>
                    </div>
                ` : ''}
                
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span><strong>₹${(order.total + (order.coupon_discount || 0)).toFixed(2)}</strong></span>
                </div>
                
                ${order.coupon_code && order.coupon_discount && order.coupon_discount > 0 ? `
                    <div class="summary-row coupon">
                        <span>Coupon Discount (${order.coupon_code}):</span>
                        <span>-₹${order.coupon_discount.toFixed(2)}</span>
                    </div>
                ` : ''}
                
                <div class="summary-row" style="color: #16a34a; font-weight: 600;">
                    <span>Delivery Discount:</span>
                    <span>-₹${(order.delivery_charge || 80).toFixed(2)}</span>
                </div>
                
                ${(productDiscount > 0 || (order.coupon_discount && order.coupon_discount > 0) || (order.delivery_charge || 80) > 0) ? `
                    <div class="summary-row savings">
                        <span>Total Savings:</span>
                        <span>₹${(productDiscount + (order.coupon_discount || 0) + (order.delivery_charge || 80)).toFixed(2)}</span>
                    </div>
                ` : ''}
                
                <div class="summary-row total">
                    <span>TOTAL PAID:</span>
                    <span>₹${order.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        <div class="status">
            <div class="status-item">
                <p>Payment Status:</p>
                <p>${order.payment_status === 'paid' ? '✅ Paid' : order.payment_status === 'refunded' ? '💰 Refunded' : order.payment_status}</p>
            </div>
            <div class="status-item">
                <p>Delivery Status:</p>
                <p>${order.delivery_status === 'return_refund' ? 'Return/Refund' : order.delivery_status === 'delivered' ? '✅ Delivered' : order.delivery_status}</p>
            </div>
        </div>
        
        <div class="footer">
            <img src="/logo.png" alt="The Weyre Co." class="footer-logo" />
            <p class="thank-you">Thank you for shopping with The Weyre Co.</p>
            <p class="contact">For any queries, contact: theweyreco.official@gmail.com</p>
            <p class="note">This is a computer-generated invoice and does not require a signature.</p>
        </div>
    </div>
    
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
        `

        printWindow.document.write(htmlContent)
        printWindow.document.close()
    }

    if (!order || !user) {
        return <div className="p-8 text-center">Loading invoice...</div>
    }

    const productDiscount = order.actual_total ? (order.actual_total - order.total - (order.coupon_discount || 0)) : 0

    return (
        <div className="bg-white p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-black">
                <div>
                    <h1 className="text-3xl font-bold text-black mb-2">INVOICE</h1>
                    <p className="text-sm text-gray-700 font-mono">Order ID: {order.order_id}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                    <div className="relative w-24 h-16 mb-2 ml-auto">
                        <Image
                            src="/logo.png"
                            alt="The Weyre Co."
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h2 className="text-xl font-bold text-black">The Weyre Co.</h2>
                    <p className="text-xs text-gray-600">Luxury Jewellery</p>
                </div>
            </div>

            {/* Customer Details */}
            <div className="mb-6">
                <h3 className="font-bold text-base mb-2 text-black">Bill To:</h3>
                <p className="font-bold text-base text-black">{user.name}</p>
                <p className="text-sm text-gray-700 font-semibold">{user.address}</p>
                <p className="text-sm text-gray-700 font-semibold">{user.city}, {user.state} {user.zipcode}</p>
                <p className="text-sm text-gray-700">Email: {user.email}</p>
                <p className="text-sm text-gray-700">Phone: {user.phone}</p>
            </div>

            {/* Order Items Table */}
            <div className="mb-6">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="text-left p-2 text-sm font-bold">Item</th>
                            <th className="text-center p-2 text-sm font-bold">Qty</th>
                            <th className="text-right p-2 text-sm font-bold">Price</th>
                            <th className="text-right p-2 text-sm font-bold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.order_items && order.order_items.map((item: any, index: number) => (
                            <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="p-2 border-b border-gray-300 text-sm">{item.products?.name || 'Product'}</td>
                                <td className="text-center p-2 border-b border-gray-300 text-sm">{item.quantity}</td>
                                <td className="text-right p-2 border-b border-gray-300 text-sm">₹{item.price.toFixed(2)}</td>
                                <td className="text-right p-2 border-b border-gray-300 text-sm font-semibold">₹{(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pricing Summary */}
            <div className="flex justify-end mb-6">
                <div className="w-80">
                    {order.actual_total && productDiscount > 0 && (
                        <>
                            <div className="flex justify-between py-1 text-sm text-gray-600">
                                <span>Original Price:</span>
                                <span className="line-through">₹{order.actual_total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1 text-sm text-green-600 font-semibold">
                                <span>Product Discount:</span>
                                <span>-₹{productDiscount.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between py-1 text-sm">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="font-semibold">₹{(order.total + (order.coupon_discount || 0)).toFixed(2)}</span>
                    </div>

                    {order.coupon_code && order.coupon_discount && order.coupon_discount > 0 && (
                        <div className="flex justify-between py-1 text-sm text-green-600 font-bold bg-green-50 px-2 rounded my-1">
                            <span>Coupon ({order.coupon_code}):</span>
                            <span>-₹{order.coupon_discount.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between py-1 text-sm text-green-600 font-semibold">
                        <span>Delivery Discount:</span>
                        <span>-₹{(order.delivery_charge || 80).toFixed(2)}</span>
                    </div>

                    {(productDiscount > 0 || (order.coupon_discount && order.coupon_discount > 0) || (order.delivery_charge || 80) > 0) && (
                        <div className="flex justify-between py-2 text-sm text-green-600 font-bold border-t border-gray-300 mt-1">
                            <span>Total Savings:</span>
                            <span>₹{(productDiscount + (order.coupon_discount || 0) + (order.delivery_charge || 80)).toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between py-3 border-t-2 border-black font-bold text-xl mt-2">
                        <span className="text-black">TOTAL PAID:</span>
                        <span className="text-black">₹{order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Status Information */}
            <div className="mb-6 grid grid-cols-2 gap-4 p-3 bg-gray-100 rounded-lg">
                <div>
                    <p className="text-xs text-gray-600 mb-1">Payment Status:</p>
                    <p className="font-bold text-sm">
                        {order.payment_status === 'paid' ? '✅ Paid' :
                            order.payment_status === 'refunded' ? '💰 Refunded' :
                                order.payment_status}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-600 mb-1">Delivery Status:</p>
                    <p className="font-bold text-sm">
                        {order.delivery_status === 'return_refund' ? 'Return/Refund' :
                            order.delivery_status === 'delivered' ? '✅ Delivered' :
                                order.delivery_status}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-black pt-4 text-center">
                <div className="relative w-24 h-16 mx-auto mb-2">
                    <Image
                        src="/logo.png"
                        alt="The Weyre Co."
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <p className="text-sm font-semibold text-black mb-1">Thank you for shopping with The Weyre Co.</p>
                <p className="text-xs text-gray-600">For any queries, contact: theweyreco.official@gmail.com</p>
                <p className="text-xs text-gray-500 mt-2">This is a computer-generated invoice and does not require a signature.</p>
            </div>

            {/* Print Button */}
            <div className="mt-6 text-center">
                <button
                    onClick={handlePrint}
                    className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition font-semibold text-base"
                >
                    🖨️ Print Invoice
                </button>
            </div>
        </div>
    )
}
