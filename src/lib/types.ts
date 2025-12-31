// Lease type options
export type LeaseType = 'month-to-month' | 'semi-annual' | 'annual' | 'custom';

// Lease information for rental properties
export interface LeaseInfo {
  type: LeaseType;
  customMonths?: number;
  startDate: Date;
  currentRent: number;
  reminderDays: number;
  isVacant: boolean;
}

// Property type for real estate investments
export interface Property {
  id: string;
  rank?: number;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  currentValue: number;
  purchasePrice: number;
  purchaseDate?: Date;
  monthlyIncome: number;
  monthlyExpenses?: number;
  mortgagePayment?: number;
  mortgageBalance?: number;
  downPayment?: number;
  appreciation: number;
  roi: number;
  propertyType: 'single-family' | 'multi-family' | 'commercial' | 'condo' | 'townhouse';
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  imageUrl?: string;
  notes?: string;
  ownedSince?: number; // Year purchased
  lease?: LeaseInfo;
}

// Portfolio metrics for the dashboard
export interface PortfolioMetrics {
  totalValue: number;
  totalEquity: number;
  monthlyCashFlow: number;
  averageROI: number;
  propertiesOwned: number;
  trends: {
    totalValue: number;
    totalEquity: number;
    monthlyCashFlow: number;
    averageROI: number;
    propertiesOwned: number;
  };
}

// Alert/Opportunity type
export interface Alert {
  id: string;
  type: 'opportunity' | 'alert' | 'rent-increase' | 'refinance' | 'value-surge';
  icon: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedValue: number;
  createdAt: Date;
  // Enhanced fields
  isRead: boolean;
  actionDeadline?: Date;
  equityGained?: number;
  percentChange?: number;
  propertyAddress?: string;
}

// Alert filter state
export interface AlertFilters {
  tab: 'all' | 'unread' | 'urgent' | 'read';
  priority: 'all' | 'high' | 'medium' | 'low';
  type: 'all' | 'opportunity' | 'alert' | 'rent-increase' | 'refinance' | 'value-surge';
  status: 'all' | 'read' | 'unread';
}

// Chart data point for portfolio trends
export interface ChartDataPoint {
  month: string;
  value: number;
}

// Navigation item type
export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

// Navigation section type
export interface NavSection {
  title: string;
  items: NavItem[];
}

// Quick stat for sidebar
export interface QuickStat {
  label: string;
  value: string;
  icon: string;
  bgColor: string;
}

// Property distribution for charts
export interface PropertyDistribution {
  type: string;
  count: number;
  color: string;
}

// Helper function to calculate lease expiration
export function getLeaseExpirationDate(lease: LeaseInfo): Date {
  const startDate = new Date(lease.startDate);
  let months = 12; // Default to annual
  
  switch (lease.type) {
    case 'month-to-month':
      months = 1;
      break;
    case 'semi-annual':
      months = 6;
      break;
    case 'annual':
      months = 12;
      break;
    case 'custom':
      months = lease.customMonths || 12;
      break;
  }
  
  const expirationDate = new Date(startDate);
  expirationDate.setMonth(expirationDate.getMonth() + months);
  return expirationDate;
}

// Helper function to get days until lease expiration
export function getDaysUntilLeaseExpiration(lease: LeaseInfo): number {
  const expirationDate = getLeaseExpirationDate(lease);
  const today = new Date();
  const diffTime = expirationDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Helper function to calculate equity
export function calculateEquity(currentValue: number, mortgageBalance: number): number {
  return currentValue - (mortgageBalance || 0);
}

// Helper function to calculate equity percentage
export function calculateEquityPercentage(currentValue: number, mortgageBalance: number): number {
  if (currentValue === 0) return 0;
  const equity = calculateEquity(currentValue, mortgageBalance);
  return (equity / currentValue) * 100;
}

// Helper function to calculate monthly profit
export function calculateMonthlyProfit(
  monthlyIncome: number,
  monthlyExpenses: number = 0,
  mortgagePayment: number = 0
): number {
  return monthlyIncome - monthlyExpenses - mortgagePayment;
}
