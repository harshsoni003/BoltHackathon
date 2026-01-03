import { motion, Variants } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Phone,
  Users,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Zap,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnalyticsChart from './AnalyticsChart';
import AgentStatsTable from './AgentStatsTable';
import CallHistoryTable from './CallHistoryTable';

// Minimalist Metrics Card
const PremiumMetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  accentColor = 'blue',
  prefix = '',
  suffix = ''
}: any) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Card className="relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </CardTitle>
          <div className={`p-2 ${accentColor === 'blue' ? 'bg-blue-50' : accentColor === 'green' ? 'bg-green-50' : 'bg-gray-50'} rounded-lg`}>
            <Icon className={`h-4 w-4 ${accentColor === 'blue' ? 'text-blue-600' : accentColor === 'green' ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {prefix}{value}{suffix}
        </div>
        <div className="flex items-center gap-2">
          {trend === 'up' ? (
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-sm font-medium text-green-600">{change}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-red-600" />
              <span className="text-sm font-medium text-red-600">{change}</span>
            </div>
          )}
          <span className="text-sm text-gray-500">vs last month</span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Profit Breakdown Component
const ProfitBreakdown = () => (
  <Card className="border border-gray-200 shadow-sm bg-white">
    <CardHeader className="border-b border-gray-100 bg-gray-50">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-bold text-gray-900">
          Revenue Breakdown
        </CardTitle>
        <PiggyBank className="h-5 w-5 text-gray-600" />
      </div>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="space-y-6">
        {[
          { label: 'Total Revenue', value: '$45,231', color: 'bg-blue-600', percentage: 100 },
          { label: 'Operating Costs', value: '$12,456', color: 'bg-gray-400', percentage: 27.5 },
          { label: 'Net Profit', value: '$32,775', color: 'bg-green-600', percentage: 72.5 },
        ].map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-lg font-bold text-gray-900">{item.value}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 1, delay: idx * 0.2 }}
                className={`h-full ${item.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// ROI Calculator Component
const ROIMetrics = () => (
  <Card className="border border-gray-200 shadow-sm bg-white">
    <CardHeader className="border-b border-gray-100 bg-gray-50">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-bold text-gray-900">
          ROI Analytics
        </CardTitle>
        <Target className="h-5 w-5 text-gray-600" />
      </div>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'ROI', value: '263%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
          { label: 'Profit Margin', value: '72.5%', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'Cost per Call', value: '$4.89', icon: Phone, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
          { label: 'Revenue/Call', value: '$17.79', icon: Wallet, color: 'text-gray-900', bg: 'bg-gray-50', border: 'border-gray-200' },
        ].map((metric, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02 }}
            className={`${metric.bg} p-4 rounded-lg border ${metric.border}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
              <span className="text-xs font-semibold text-gray-600 uppercase">{metric.label}</span>
            </div>
            <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Cost Analysis Component
const CostAnalysis = () => (
  <Card className="border border-gray-200 shadow-sm bg-white">
    <CardHeader className="border-b border-gray-100 bg-gray-50">
      <CardTitle className="text-lg font-bold text-gray-900">
        Cost Analysis
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="space-y-4">
        {[
          { category: 'AI Model Costs', amount: '$8,234', percentage: 66, color: 'bg-gray-700' },
          { category: 'Infrastructure', amount: '$2,456', percentage: 20, color: 'bg-gray-500' },
          { category: 'Support & Maintenance', amount: '$1,766', percentage: 14, color: 'bg-gray-400' },
        ].map((cost, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{cost.category}</span>
              <span className="text-sm font-bold text-gray-900">{cost.amount}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cost.percentage}%` }}
                  transition={{ duration: 1, delay: idx * 0.2 }}
                  className={`h-full ${cost.color}`}
                />
              </div>
              <span className="text-xs font-semibold text-gray-500 w-12 text-right">{cost.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

interface AnalyticsDashboardProps {
  data?: any;
}

export const AnalyticsDashboard = ({ data }: AnalyticsDashboardProps) => {
  // Mock data for AnalyticsChart
  const chartData = [
    { date: '2024-01-01', calls: 45, successRate: 92 },
    { date: '2024-01-02', calls: 52, successRate: 88 },
    { date: '2024-01-03', calls: 38, successRate: 95 },
    { date: '2024-01-04', calls: 65, successRate: 91 },
    { date: '2024-01-05', calls: 58, successRate: 94 },
    { date: '2024-01-06', calls: 48, successRate: 89 },
    { date: '2024-01-07', calls: 55, successRate: 93 },
  ];

  const topDate = {
    date: '2024-01-04',
    numberOfCalls: 65,
  };

  // Mock data for AgentStatsTable
  const agentStats = [
    { agentName: 'Customer Support Bot', numberOfCalls: 1245, callMinutes: 3890, llmCost: '$12.45', creditsSpent: '245' },
    { agentName: 'Sales Assistant', numberOfCalls: 892, callMinutes: 2156, llmCost: '$8.92', creditsSpent: '178' },
    { agentName: 'Technical Support', numberOfCalls: 406, callMinutes: 1523, llmCost: '$4.06', creditsSpent: '98' },
  ];

  const languageStats = [
    { language: 'English', percentage: 68.5 },
    { language: 'Spanish', percentage: 18.2 },
    { language: 'French', percentage: 8.7 },
    { language: 'German', percentage: 4.6 },
  ];

  // Properly typed variants for framer-motion
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  };

  const profitMetrics = [
    {
      title: 'Total Revenue',
      value: '45,231',
      change: '+24.5%',
      icon: DollarSign,
      trend: 'up',
      accentColor: 'blue',
      prefix: '$',
    },
    {
      title: 'Net Profit',
      value: '32,775',
      change: '+18.2%',
      icon: TrendingUp,
      trend: 'up',
      accentColor: 'green',
      prefix: '$',
    },
    {
      title: 'Total Calls',
      value: '2,543',
      change: '+12.3%',
      icon: Phone,
      trend: 'up',
      accentColor: 'gray',
    },
    {
      title: 'Avg Call Value',
      value: '17.79',
      change: '+8.4%',
      icon: Wallet,
      trend: 'up',
      accentColor: 'blue',
      prefix: '$',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl shadow-sm">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Revenue Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time profit tracking and performance insights
            </p>
          </div>
        </div>
      </motion.div>

      {/* Premium Metrics Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {profitMetrics.map((metric, idx) => (
          <PremiumMetricCard key={idx} {...metric} />
        ))}
      </motion.div>

      {/* Profit & ROI Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <ProfitBreakdown />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <ROIMetrics />
        </motion.div>
      </div>

      {/* Analytics Chart */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-bold text-gray-900">Call Volume & Success Trends</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <AnalyticsChart data={chartData} topDate={topDate} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Cost Analysis & Agent Performance */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1"
        >
          <CostAnalysis />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <Card className="border border-gray-200 shadow-sm bg-white h-full">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-bold text-gray-900">Agent Performance & Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <AgentStatsTable agentStats={agentStats} languageStats={languageStats} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Call History */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-bold text-gray-900">Recent Call Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CallHistoryTable />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
