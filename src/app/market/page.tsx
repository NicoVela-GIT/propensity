'use client';

import { TrendingUp, BarChart3, MapPin, DollarSign } from 'lucide-react';

export default function MarketInsightsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
        <div className="bg-green-600 p-2 rounded-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Market Insights
          </h1>
          <p className="text-gray-600">
            Real estate market trends and analysis
          </p>
        </div>
      </div>

      {/* Coming Soon Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Market Trends',
            description: 'Track property value trends in your areas',
            icon: BarChart3,
            color: 'bg-blue-500',
          },
          {
            title: 'Area Analysis',
            description: 'Compare neighborhoods and investment zones',
            icon: MapPin,
            color: 'bg-purple-500',
          },
          {
            title: 'Price Predictions',
            description: 'AI-powered property value forecasts',
            icon: DollarSign,
            color: 'bg-green-500',
          },
        ].map((item, index) => (
          <div
            key={item.title}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`${item.color} p-3 rounded-lg w-fit mb-4`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-gray-600 mb-4">{item.description}</p>
            <span className="text-sm text-blue-600 font-medium">
              Coming Soon
            </span>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div
        className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100 animate-fade-in-up"
        style={{ animationDelay: '400ms' }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📊 Market Data Integration
        </h3>
        <p className="text-gray-600">
          Connect to real estate APIs like Zillow, Attom, or Redfin to get
          real-time market data, comparable sales, and automated property
          valuations. This feature will be available after database integration.
        </p>
      </div>
    </div>
  );
}

