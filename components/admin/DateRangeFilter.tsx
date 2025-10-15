'use client'
import React, { useState } from 'react'

interface DateRangeFilterProps {
    onFilterChange: (month: number | null, year: number | null) => void
    currentMonth: number | null
    currentYear: number | null
}

export default function DateRangeFilter({ onFilterChange, currentMonth, currentYear }: DateRangeFilterProps) {
    const currentDate = new Date()
    const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth)
    const [selectedYear, setSelectedYear] = useState<number | null>(currentYear)

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ]

    // Generate years (current year and 5 years back)
    const years = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - i)

    const handleApply = () => {
        onFilterChange(selectedMonth, selectedYear)
    }

    const handleClear = () => {
        setSelectedMonth(null)
        setSelectedYear(null)
        onFilterChange(null, null)
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white font-medium">Filter by Period:</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    {/* Month Selector */}
                    <select
                        value={selectedMonth || ''}
                        onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
                        className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-white transition"
                    >
                        <option value="">All Months</option>
                        {months.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>

                    {/* Year Selector */}
                    <select
                        value={selectedYear || ''}
                        onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                        className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-white transition"
                    >
                        <option value="">All Years</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleApply}
                            className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                        >
                            Apply
                        </button>
                        <button
                            onClick={handleClear}
                            className="border border-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Current Filter Display */}
            {(currentMonth || currentYear) && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400">
                        Showing data for:{' '}
                        <span className="text-white font-medium">
                            {currentMonth && months.find(m => m.value === currentMonth)?.label}{' '}
                            {currentYear}
                        </span>
                    </p>
                </div>
            )}
        </div>
    )
}
