'use client';

import { useState } from 'react';
import { properties } from '@/lib/data';
import { Property as OldProperty } from '@/lib/types';
import {
  convertOldPropertyToNew,
  convertNewPropertyToOld,
  calculateEquity,
  calculateEquityPercentage,
  calculateTotalROI,
  calculateCashOnCashReturn,
  calculateMonthlyCashFlow,
  calculateAppreciation,
  calculateCapRate,
  calculateNOI,
} from '@/lib/domain';
import { Card } from '@/components/ui/card';

export default function DomainTestPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0].id);
  const [simulateHELOC, setSimulateHELOC] = useState(false);
  const [helocAmount, setHelocAmount] = useState(15000);
  const [helocPayment, setHelocPayment] = useState(250);

  // Get selected property
  const oldProperty = properties.find(p => p.id === selectedPropertyId)!;

  // Convert to new domain model
  const { property, capitalStructure, loan, valuation, loanBalance, lease } = 
    convertOldPropertyToNew(oldProperty);

  // Prepare loan data (with optional HELOC simulation)
  const loanBalances = loanBalance ? [loanBalance.principalBalance] : [];
  const loanPayments = loan ? [loan.terms.monthlyPayment] : [];

  if (simulateHELOC) {
    loanBalances.push(helocAmount);
    loanPayments.push(helocPayment);
  }

  // Calculate metrics using OLD model (stored values)
  const oldMetrics = {
    roi: oldProperty.roi,
    equity: oldProperty.currentValue - (oldProperty.mortgageBalance || 0),
    equityPercent: oldProperty.currentValue > 0
      ? ((oldProperty.currentValue - (oldProperty.mortgageBalance || 0)) / oldProperty.currentValue) * 100
      : 0,
    appreciation: oldProperty.appreciation,
    cashFlow: oldProperty.monthlyIncome - (oldProperty.monthlyExpenses || 0) - (oldProperty.mortgagePayment || 0),
  };

  // Calculate metrics using NEW model (computed values)
  const newMetrics = {
    equity: calculateEquity(valuation.estimatedValue, loanBalances),
    equityPercent: calculateEquityPercentage(valuation.estimatedValue, loanBalances),
    appreciation: calculateAppreciation(valuation.estimatedValue, property.purchasePrice),
    cashFlow: calculateMonthlyCashFlow(
      lease?.monthlyRent || 0,
      oldProperty.monthlyExpenses || 0,
      loanPayments
    ),
    noi: calculateNOI(lease?.monthlyRent || 0, oldProperty.monthlyExpenses || 0),
    cashOnCash: calculateCashOnCashReturn(
      calculateMonthlyCashFlow(
        lease?.monthlyRent || 0,
        oldProperty.monthlyExpenses || 0,
        loanPayments
      ) * 12,
      capitalStructure.initialCapital.cashInvested
    ),
    capRate: calculateCapRate(
      calculateNOI(lease?.monthlyRent || 0, oldProperty.monthlyExpenses || 0) * 12,
      valuation.estimatedValue
    ),
  };

  // For total ROI, we need year-over-year data (simplified for demo)
  const annualCashFlow = newMetrics.cashFlow * 12;
  const appreciationAmount = valuation.estimatedValue - property.purchasePrice;
  const principalPaydown = simulateHELOC ? 2000 : 1500; // Estimated annual paydown

  const totalROI = calculateTotalROI(
    annualCashFlow,
    valuation.estimatedValue,
    property.purchasePrice,
    loanBalances,
    [(loan?.terms.originalPrincipal || 0) + (simulateHELOC ? helocAmount : 0)],
    capitalStructure.initialCapital.cashInvested
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Domain Model Demo
          </h1>
          <p className="text-gray-600">
            Compare old (stored) vs new (computed) financial calculations
          </p>
        </div>

        {/* Property Selector */}
        <Card className="p-6 mb-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Select Property</h2>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full p-3 border rounded-lg text-lg"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.address}, {p.city}, {p.state} - ${p.currentValue.toLocaleString('en-US')}
              </option>
            ))}
          </select>

          {/* Multi-Loan Simulator */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateHELOC}
                onChange={(e) => setSimulateHELOC(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-medium text-gray-900">
                Simulate Second Loan (HELOC)
              </span>
            </label>

            {simulateHELOC && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HELOC Balance
                  </label>
                  <input
                    type="number"
                    value={helocAmount}
                    onChange={(e) => setHelocAmount(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Payment
                  </label>
                  <input
                    type="number"
                    value={helocPayment}
                    onChange={(e) => setHelocPayment(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Property Details */}
        <Card className="p-6 mb-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Property Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Purchase Price</p>
              <p className="font-semibold text-lg">${property.purchasePrice.toLocaleString('en-US')}</p>
            </div>
            <div>
              <p className="text-gray-500">Current Value</p>
              <p className="font-semibold text-lg">${valuation.estimatedValue.toLocaleString('en-US')}</p>
            </div>
            <div>
              <p className="text-gray-500">Cash Invested</p>
              <p className="font-semibold text-lg">${capitalStructure.initialCapital.cashInvested.toLocaleString('en-US')}</p>
            </div>
            <div>
              <p className="text-gray-500">Monthly Rent</p>
              <p className="font-semibold text-lg">${(lease?.monthlyRent || 0).toLocaleString('en-US')}</p>
            </div>
          </div>
        </Card>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* OLD MODEL */}
          <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Old Model</h2>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                Stored Values
              </span>
            </div>

            <div className="space-y-4">
              <MetricRow
                label="ROI"
                value={`${oldMetrics.roi.toFixed(1)}%`}
                note="Stored in database"
              />
              <MetricRow
                label="Equity"
                value={`$${oldMetrics.equity.toLocaleString('en-US')}`}
                note="Single loan only"
              />
              <MetricRow
                label="Equity %"
                value={`${oldMetrics.equityPercent.toFixed(1)}%`}
                note="Of current value"
              />
              <MetricRow
                label="Appreciation"
                value={`${oldMetrics.appreciation.toFixed(1)}%`}
                note="Stored value"
              />
              <MetricRow
                label="Monthly Cash Flow"
                value={`$${oldMetrics.cashFlow.toLocaleString('en-US')}`}
                note="Simple calculation"
              />
              <div className="pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  ⚠️ Limitations:
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Stored values can become stale</li>
                  <li>• Doesn't support multiple loans</li>
                  <li>• No historical tracking</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* NEW MODEL */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-900">New Model</h2>
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                Computed Live
              </span>
            </div>

            <div className="space-y-4">
              <MetricRow
                label="Total ROI"
                value={`${totalROI.toFixed(1)}%`}
                note="Cash flow + appreciation + paydown"
                highlight
              />
              <MetricRow
                label="Equity"
                value={`$${newMetrics.equity.toLocaleString('en-US')}`}
                note={simulateHELOC ? `Includes ${loanBalances.length} loans` : "Multi-loan ready"}
                highlight={simulateHELOC}
              />
              <MetricRow
                label="Equity %"
                value={`${newMetrics.equityPercent.toFixed(1)}%`}
                note="Always accurate"
                highlight
              />
              <MetricRow
                label="Appreciation"
                value={`${newMetrics.appreciation.toFixed(1)}%`}
                note="Computed from snapshots"
                highlight
              />
              <MetricRow
                label="Monthly Cash Flow"
                value={`$${newMetrics.cashFlow.toLocaleString('en-US')}`}
                note={simulateHELOC ? `Includes all ${loanPayments.length} loan payments` : "Accurate debt service"}
                highlight={simulateHELOC}
              />
              <MetricRow
                label="Cash-on-Cash Return"
                value={`${newMetrics.cashOnCash.toFixed(2)}%`}
                note="Annual cash flow / cash invested"
                highlight
              />
              <MetricRow
                label="Cap Rate"
                value={`${newMetrics.capRate.toFixed(2)}%`}
                note="NOI / property value"
                highlight
              />
              <div className="pt-4 border-t border-blue-300">
                <p className="text-sm text-blue-900 font-medium">
                  ✅ Advantages:
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Always accurate (computed on-demand)</li>
                  <li>• Supports multiple loans</li>
                  <li>• Ready for time-series data</li>
                  <li>• Proper financial formulas</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Comparison Summary */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Key Differences</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ComparisonItem
              title="Data Storage"
              old="Stores derived metrics (ROI, appreciation) in database"
              new="Stores only source data, computes metrics on-demand"
              advantage="Always accurate, never stale"
            />
            <ComparisonItem
              title="Multi-Loan Support"
              old="Single mortgage per property"
              new="Unlimited loans per property (mortgage, HELOC, seller financing)"
              advantage="Accurate debt calculations"
            />
            <ComparisonItem
              title="Time-Series"
              old="Single current value"
              new="Historical snapshots with effective dates"
              advantage="Track value changes over time"
            />
          </div>
        </Card>

        {/* Technical Details */}
        <Card className="p-6 bg-gray-900 text-white mt-6">
          <h2 className="text-xl font-semibold mb-4">Technical Implementation</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2 text-blue-400">Domain Entities Created</h3>
              <ul className="space-y-1 font-mono text-gray-300">
                <li>• Property (core immutable data)</li>
                <li>• CapitalStructure (acquisition financing)</li>
                <li>• Loan (debt obligations)</li>
                <li>• ValuationSnapshot (time-series values)</li>
                <li>• LoanBalanceSnapshot (balance history)</li>
                <li>• Lease (rental agreements)</li>
                <li>• Expense (operating costs)</li>
                <li>• Alert (derived signals)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-green-400">Computed Functions Available</h3>
              <ul className="space-y-1 font-mono text-gray-300">
                <li>• calculateEquity()</li>
                <li>• calculateTotalROI()</li>
                <li>• calculateCashOnCashReturn()</li>
                <li>• calculateAppreciation()</li>
                <li>• calculateMonthlyCashFlow()</li>
                <li>• calculateNOI()</li>
                <li>• calculateCapRate()</li>
                <li>• ... and 15+ more functions</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-800 rounded">
            <p className="text-sm text-gray-300">
              <strong className="text-green-400">✓ Ready for Supabase:</strong> All types match the planned database schema. 
              When you connect Supabase, just swap mock data for database queries - all calculations stay the same!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper Components

function MetricRow({ 
  label, 
  value, 
  note, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  note: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'bg-blue-200 bg-opacity-50' : 'bg-white bg-opacity-50'}`}>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-xl font-bold ${highlight ? 'text-blue-900' : 'text-gray-900'}`}>
          {value}
        </span>
      </div>
      <p className="text-xs text-gray-600">{note}</p>
    </div>
  );
}

function ComparisonItem({ 
  title, 
  old, 
  new: newText, 
  advantage 
}: { 
  title: string; 
  old: string; 
  new: string; 
  advantage: string;
}) {
  return (
    <div>
      <h3 className="font-semibold mb-3 text-gray-900">{title}</h3>
      <div className="space-y-3">
        <div className="p-3 bg-gray-100 rounded">
          <p className="text-xs text-gray-500 mb-1">OLD</p>
          <p className="text-sm text-gray-700">{old}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs text-blue-600 mb-1">NEW</p>
          <p className="text-sm text-blue-900">{newText}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-green-500 mt-0.5">✓</span>
          <p className="text-sm text-gray-600">{advantage}</p>
        </div>
      </div>
    </div>
  );
}
