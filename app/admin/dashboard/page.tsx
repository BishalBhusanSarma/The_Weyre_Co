'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavbar from '@/components/AdminNavbar'
import StatisticsCard from '@/components/admin/StatisticsCard'
import DateRangeFilter from '@/components/admin/DateRangeFilter'
import {
    calculateStatistics,
    getMonthDateRange,
    formatCurrency,
    formatNumber,
    type DashboardStats
} from '@/lib/analyticsService'
import { downloadMonthlyReport } from '@/lib/excelExportService'

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
    const [selectedYear, setSelectedYear] = useState<number | null>(null)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        loadStatistics()
    }, [selectedMonth, selectedYear])

    const loadStatistics = async () => {
        try {
            setLoading(true)
            setError(null)

            let dateRange = undefined
            if (selectedMonth && selectedYear) {
                dateRange = getMonthDateRange(selectedMonth, selectedYear)
            }

            const statistics = await calculateStatistics(dateRange)
            setStats(statistics)
        } catch (err) {
            console.error('Error loading statistics:', err)
            setError('Failed to load statistics. Please refresh the page.')
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (month: number | null, year: number | null) => {
        setSelectedMonth(month)
        setSelectedYear(year)
    }

    const handleDownloadReport = async () => {
        if (!selectedMonth || !selectedYear) {
            alert('Please select a month and year to download the report.')
            return
        }

        try {
            setDownloading(true)
            await downloadMonthlyReport(selectedMonth, selectedYear)
        } catch (err) {
            console.error('Error downloading report:', err)
            alert('Failed to generate report. Please try again.')
        } finally {
            setDownloading(false)
        }
    }

    // Skeleton Loader
    const StatsSkeleton = () => (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="h-4 bg-gray-800 rounded w-1/3 mb-2"></div>
                    <div className="h-8 bg-gray-800 rounded w-2/3"></div>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded-xl"></div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-black">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
                    <p className="text-gray-400">Track your business performance and financial metrics</p>
                </div>

                {/* Date Range Filter */}
                <DateRangeFilter
                    onFilterChange={handleFilterChange}
                    currentMonth={selectedMonth}
                    currentYear={selectedYear}
                />

                {/* Download Button */}
                <div className="mb-6">
                    <button
                        onClick={handleDownloadReport}
                        disabled={downloading || !selectedMonth || !selectedYear}
                        className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {downloading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Report...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Excel Report
                            </>
                        )}
                    </button>
                    {!selectedMonth || !selectedYear ? (
                        <p className="text-sm text-gray-500 mt-2">Select a month and year to download report</p>
                    ) : null}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
                        <p>{error}</p>
                        <button
                            onClick={loadStatistics}
                            className="mt-2 text-sm underline hover:no-underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Statistics Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[...Array(6)].map((_, i) => (
                            <StatsSkeleton key={i} />
                        ))}
                    </div>
                ) : stats ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {/* Total Revenue */}
                            <StatisticsCard
                                title="Total Revenue"
                                value={formatCurrency(stats.totalRevenue)}
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                                color="green"
                                subtitle={`${formatNumber(stats.orderCount)} orders`}
                            />

                            {/* Total Returns */}
                            <StatisticsCard
                                title="Total Returns"
                                value={formatCurrency(stats.totalReturns)}
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                }
                                color="red"
                                subtitle={`${formatNumber(stats.returnCount)} returns`}
                            />

                            {/* Net Sales */}
                            <StatisticsCard
                                title="Net Sales"
                                value={formatCurrency(stats.netSales)}
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                }
                                color="blue"
                                subtitle="Revenue - Returns"
                            />

                            {/* Delivery Charges */}
                            <StatisticsCard
                                title="Delivery Charges"
                                value={formatCurrency(stats.totalDeliveryCharges)}
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                }
                                color="yellow"
                                subtitle="Shipping expenses"
                            />

                            {/* RTO Costs */}
                            <StatisticsCard
                                title="RTO Costs"
                                value={formatCurrency(stats.totalRTOCosts)}
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                                    </svg>
                                }
                                color="red"
                                subtitle={`${formatNumber(stats.rtoCount)} RTO orders`}
                            />

                            {/* Net Profit */}
                            <StatisticsCard
                                title="Net Profit"
                                value={formatCurrency(stats.netProfit)}
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                }
                                color="purple"
                                subtitle={`Margin: ${stats.netSales > 0 ? ((stats.netProfit / stats.netSales) * 100).toFixed(1) : 0}%`}
                            />
                        </div>

                        {/* No Data Message */}
                        {stats.orderCount === 0 && (
                            <div className="mt-8 text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
                                <p className="text-gray-400">
                                    {selectedMonth && selectedYear
                                        ? 'No orders found for the selected period.'
                                        : 'No orders in the system yet.'}
                                </p>
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    )
}
