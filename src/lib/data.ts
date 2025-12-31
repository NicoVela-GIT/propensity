import { Property, PortfolioMetrics, Alert, ChartDataPoint, PropertyDistribution } from './types';

// Mock portfolio metrics
export const portfolioMetrics: PortfolioMetrics = {
  totalValue: 1095000,
  totalEquity: 630490,
  monthlyCashFlow: 4757,
  averageROI: 17.4,
  propertiesOwned: 6,
  trends: {
    totalValue: 12.4,
    totalEquity: 8.2,
    monthlyCashFlow: 5.1,
    averageROI: 2.3,
    propertiesOwned: 1,
  },
};

// Mock properties data with full details
export const properties: Property[] = [
  {
    id: '1',
    rank: 1,
    address: '2029 Estes St',
    city: 'Muskegon',
    state: 'MI',
    zipCode: '49441',
    currentValue: 190000,
    purchasePrice: 115000,
    purchaseDate: new Date('2022-03-31'),
    monthlyIncome: 4037,
    monthlyExpenses: 717,
    mortgagePayment: 1100,
    mortgageBalance: 95000,
    downPayment: 5000,
    appreciation: 65.2,
    roi: 532.8,
    propertyType: 'single-family',
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 982,
    yearBuilt: 1940,
    ownedSince: 2022,
    lease: {
      type: 'annual',
      startDate: new Date('2024-03-31'),
      currentRent: 4037,
      reminderDays: 30,
      isVacant: false,
    },
  },
  {
    id: '2',
    rank: 2,
    address: '2104 Harrison Ave',
    city: 'Muskegon',
    state: 'MI',
    zipCode: '49441',
    currentValue: 300000,
    purchasePrice: 250000,
    purchaseDate: new Date('2023-06-15'),
    monthlyIncome: 2200,
    monthlyExpenses: 544,
    mortgagePayment: 1200,
    mortgageBalance: 200000,
    downPayment: 50000,
    appreciation: 20.0,
    roi: 3.5,
    propertyType: 'single-family',
    bedrooms: 4,
    bathrooms: 2,
    squareFeet: 1575,
    yearBuilt: 1955,
    ownedSince: 2023,
    lease: {
      type: 'annual',
      startDate: new Date('2024-06-15'),
      currentRent: 2200,
      reminderDays: 45,
      isVacant: false,
    },
  },
  {
    id: '3',
    rank: 3,
    address: '1295 S Getty St',
    city: 'Muskegon',
    state: 'MI',
    zipCode: '49442',
    currentValue: 110000,
    purchasePrice: 85000,
    purchaseDate: new Date('2025-01-10'),
    monthlyIncome: 1500,
    monthlyExpenses: 350,
    mortgagePayment: 400,
    mortgageBalance: 60000,
    downPayment: 25000,
    appreciation: 29.4,
    roi: 12.9,
    propertyType: 'single-family',
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 800,
    yearBuilt: 1948,
    ownedSince: 2025,
    lease: {
      type: 'month-to-month',
      startDate: new Date('2025-01-15'),
      currentRent: 1500,
      reminderDays: 14,
      isVacant: false,
    },
  },
  {
    id: '4',
    rank: 4,
    address: '525 Catawba Ave',
    city: 'Muskegon',
    state: 'MI',
    zipCode: '49442',
    currentValue: 145000,
    purchasePrice: 98000,
    purchaseDate: new Date('2023-09-20'),
    monthlyIncome: 1800,
    monthlyExpenses: 420,
    mortgagePayment: 650,
    mortgageBalance: 72000,
    downPayment: 26000,
    appreciation: 48.0,
    roi: 18.5,
    propertyType: 'single-family',
    bedrooms: 3,
    bathrooms: 1,
    squareFeet: 1200,
    yearBuilt: 1952,
    ownedSince: 2023,
    lease: {
      type: 'annual',
      startDate: new Date('2024-09-20'),
      currentRent: 1800,
      reminderDays: 30,
      isVacant: false,
    },
  },
  {
    id: '5',
    rank: 5,
    address: '103 Sigel Ave',
    city: 'Battle Creek',
    state: 'MI',
    zipCode: '49037',
    currentValue: 95000,
    purchasePrice: 65000,
    purchaseDate: new Date('2024-02-14'),
    monthlyIncome: 1100,
    monthlyExpenses: 280,
    mortgagePayment: 380,
    mortgageBalance: 48000,
    downPayment: 17000,
    appreciation: 46.2,
    roi: 15.8,
    propertyType: 'single-family',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 800,
    yearBuilt: 1945,
    ownedSince: 2024,
    lease: {
      type: 'annual',
      startDate: new Date('2024-03-01'),
      currentRent: 1100,
      reminderDays: 30,
      isVacant: false,
    },
  },
  {
    id: '6',
    rank: 6,
    address: '2286 Torrent St',
    city: 'Muskegon',
    state: 'MI',
    zipCode: '49441',
    currentValue: 155000,
    purchasePrice: 110000,
    purchaseDate: new Date('2024-05-01'),
    monthlyIncome: 1650,
    monthlyExpenses: 390,
    mortgagePayment: 580,
    mortgageBalance: 82000,
    downPayment: 28000,
    appreciation: 40.9,
    roi: 14.2,
    propertyType: 'single-family',
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 1000,
    yearBuilt: 1950,
    ownedSince: 2024,
    lease: {
      type: 'semi-annual',
      startDate: new Date('2024-11-01'),
      currentRent: 1650,
      reminderDays: 30,
      isVacant: false,
    },
  },
];

// Mock alerts with enhanced fields
export const alerts: Alert[] = [
  {
    id: '1',
    type: 'value-surge',
    icon: '📈',
    title: 'Property Value Surge Detected',
    description: 'Your Oak Street property has increased 8.2% in value this quarter, outperforming the local market average of 3.1%.',
    priority: 'high',
    estimatedValue: 70000,
    createdAt: new Date('2025-09-14'),
    isRead: false,
    actionDeadline: new Date('2024-12-30'),
    equityGained: 70000,
    percentChange: 8.2,
    propertyAddress: '2029 Estes St',
  },
  {
    id: '2',
    type: 'refinance',
    icon: '🔄',
    title: 'Refinancing Opportunity Available',
    description: 'Interest rates have dropped significantly. You could save up to $400/month by refinancing your Harrison Ave property.',
    priority: 'medium',
    estimatedValue: 33600,
    createdAt: new Date('2025-09-10'),
    isRead: false,
    actionDeadline: new Date('2025-01-15'),
    equityGained: 33600,
    percentChange: -1.5,
    propertyAddress: '2104 Harrison Ave',
  },
  {
    id: '3',
    type: 'rent-increase',
    icon: '💰',
    title: 'Rent Increase Potential',
    description: 'Market rents in your Market Street area have increased 12%. Consider raising rent at next lease renewal.',
    priority: 'medium',
    estimatedValue: 4200,
    createdAt: new Date('2025-08-28'),
    isRead: true,
    actionDeadline: new Date('2025-03-01'),
    equityGained: 4200,
    percentChange: 12.0,
    propertyAddress: '103 Sigel Ave',
  },
];

// Mock chart data for portfolio value trend
export const portfolioChartData: ChartDataPoint[] = [
  { month: 'Jan', value: 1050000 },
  { month: 'Feb', value: 1055000 },
  { month: 'Mar', value: 1060000 },
  { month: 'Apr', value: 1070000 },
  { month: 'May', value: 1072000 },
  { month: 'Jun', value: 1075000 },
  { month: 'Jul', value: 1078000 },
  { month: 'Aug', value: 1082000 },
  { month: 'Sep', value: 1085000 },
  { month: 'Oct', value: 1090000 },
  { month: 'Nov', value: 1092000 },
  { month: 'Dec', value: 1095000 },
];

// Property distribution data
export const propertyDistribution: PropertyDistribution[] = [
  { type: 'Single Family', count: 6, color: '#3B82F6' },
];

// Helper functions
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function formatFullCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// Get property by ID
export function getPropertyById(id: string): Property | undefined {
  return properties.find(p => p.id === id);
}

// Get filtered properties
export function getFilteredProperties(
  searchQuery: string,
  propertyType: string
): Property[] {
  return properties.filter(property => {
    const matchesSearch = searchQuery === '' || 
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = propertyType === 'all' || property.propertyType === propertyType;
    
    return matchesSearch && matchesType;
  });
}

// Get alert counts for KPIs
export function getAlertCounts() {
  return {
    total: alerts.length,
    unread: alerts.filter(a => !a.isRead).length,
    highPriority: alerts.filter(a => a.priority === 'high').length,
    opportunities: alerts.filter(a => a.type === 'opportunity' || a.estimatedValue > 0).length,
  };
}
