'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  PieChart,
  Wallet,
  Percent,
  Building2,
  PlusCircle,
} from 'lucide-react';
import { KPICard, PortfolioChart, TopPerformingProperties } from '@/components/dashboard';
import RightPanel from '@/components/layout/RightPanel';
import { portfolioMetrics, portfolioChartData, formatCurrency, propertyDistribution } from '@/lib/data';
import { getAllProperties } from '@/lib/supabase/services/property.service';
import {
  convertOldPropertyToNew,
  calculateEquity,
  calculateMonthlyCashFlow,
  calculateWeightedPortfolioROI,
} from '@/lib/domain';
import type { Property } from '@/lib/types';
import type { AlertWithState } from '@/lib/supabase/repositories/alerts.repository';

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [alerts, setAlerts] = useState<AlertWithState[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch properties and alerts on mount
  useEffect(() => {
    Promise.all([
      getAllProperties(),
      fetch('/api/alerts').then(res => res.json()),
    ]).then(([propertiesData, alertsResponse]) => {
      setProperties(propertiesData);
      setAlerts(alertsResponse.success ? alertsResponse.data : []);
      setLoading(false);
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Calculate portfolio metrics using domain model
  const portfolioWithDomain = properties.map(p => {
    const { property, capitalStructure, valuation, loanBalance, loan, lease } = convertOldPropertyToNew(p);
    
    // Calculate metrics
    const equity = calculateEquity(
      valuation.estimatedValue,
      loanBalance ? [loanBalance.principalBalance] : []
    );
    
    const cashFlow = calculateMonthlyCashFlow(
      lease?.monthlyRent || 0,
      p.monthlyExpenses || 0,
      loan ? [loan.terms.monthlyPayment] : []
    );
    
    return {
      ...p,
      computedEquity: equity,
      computedCashFlow: cashFlow,
      cashInvested: capitalStructure.initialCapital.cashInvested,
    };
  });
  
  // Calculate accurate portfolio metrics from actual properties
  const computedTotalValue = properties.reduce((sum, p) => sum + p.currentValue, 0);
  const computedTotalEquity = portfolioWithDomain.reduce((sum, p) => sum + p.computedEquity, 0);
  const computedMonthlyCashFlow = portfolioWithDomain.reduce((sum, p) => sum + p.computedCashFlow, 0);
  const computedPropertiesOwned = properties.length;
  
  // Calculate weighted average ROI
  const roiData = portfolioWithDomain.map(p => ({
    roi: p.roi,
    cashInvested: p.cashInvested,
  }));
  const computedAverageROI = calculateWeightedPortfolioROI(roiData);
  
  // Use mock trends for now (requires historical data)
  const { trends } = portfolioMetrics;

  return (
    <div className="flex">
      {/* Main Dashboard Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Portfolio Dashboard
            </h1>
            <p className="text-gray-600">
              Track your real estate investments and opportunities
            </p>
          </div>
          <Link
            href="/properties/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 self-start lg:self-auto shadow-sm btn-press hover:shadow-md"
          >
            <PlusCircle className="w-5 h-5" />
            Add Property
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
          <div className="animate-fade-in-up stagger-1">
            <KPICard
              title="Total Portfolio Value"
              value={formatCurrency(computedTotalValue)}
              trend={trends.totalValue}
              icon={<DollarSign className="w-6 h-6" />}
              iconBgColor="bg-green-500"
            />
          </div>
          <div className="animate-fade-in-up stagger-2">
            <KPICard
              title="Total Equity"
              value={formatCurrency(computedTotalEquity)}
              trend={trends.totalEquity}
              icon={<PieChart className="w-6 h-6" />}
              iconBgColor="bg-blue-500"
            />
          </div>
          <div className="animate-fade-in-up stagger-3">
            <KPICard
              title="Monthly Cash Flow"
              value={formatCurrency(computedMonthlyCashFlow)}
              trend={trends.monthlyCashFlow}
              icon={<Wallet className="w-6 h-6" />}
              iconBgColor="bg-purple-500"
            />
          </div>
          <div className="animate-fade-in-up stagger-4">
            <KPICard
              title="Average ROI"
              value={`${Math.round(computedAverageROI)}%`}
              trend={trends.averageROI}
              icon={<Percent className="w-6 h-6" />}
              iconBgColor="bg-orange-500"
            />
          </div>
          <div className="animate-fade-in-up stagger-5">
            <KPICard
              title="Properties Owned"
              value={computedPropertiesOwned.toString()}
              trend={trends.propertiesOwned}
              trendLabel="vs last month"
              icon={<Building2 className="w-6 h-6" />}
              iconBgColor="bg-cyan-500"
            />
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <PortfolioChart data={portfolioChartData} />
        </div>

        {/* Top Performing Properties */}
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <TopPerformingProperties properties={properties} maxDisplay={3} />
        </div>
      </div>

      {/* Right Panel - Only on Dashboard, Hidden on mobile/tablet */}
      <div className="hidden lg:block">
        <RightPanel
          alerts={alerts}
          propertyDistribution={propertyDistribution}
        />
      </div>
    </div>
  );
}
