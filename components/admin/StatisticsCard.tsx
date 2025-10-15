'use client'
import React from 'react'

interface StatisticsCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    color: 'green' | 'red' | 'blue' | 'yellow' | 'purple'
    subtitle?: string
    prefix?: string
    suffix?: string
}

export default function StatisticsCard({
    title,
    value,
    icon,
    color,
    subtitle,
    prefix = '',
    suffix = ''
}: StatisticsCardProps) {
    const colorClasses = {
        green: 'bg-green-500/10 text-green-500 border-green-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    }

    const iconBgClasses = {
        green: 'bg-green-500/20',
        red: 'bg-red-500/20',
        blue: 'bg-blue-500/20',
        yellow: 'bg-yellow-500/20',
        purple: 'bg-purple-500/20'
    }

    return (
        <div className={`${colorClasses[color]} border rounded-2xl p-4 md:p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-400 mb-1">{title}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                        {prefix}{value}{suffix}
                    </h3>
                    {subtitle && (
                        <p className="text-xs md:text-sm text-gray-400 mt-2">{subtitle}</p>
                    )}
                </div>
                <div className={`${iconBgClasses[color]} p-3 rounded-xl`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
