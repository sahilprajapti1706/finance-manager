import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  Activity,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardApi } from '../api/dashboard.api';
import type { DashboardSummary, CategoryTotal, TrendData, FinancialRecord } from '../types';

const COLORS = ['#6366F1', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#EC4899'];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<CategoryTotal[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [recent, setRecent] = useState<FinancialRecord[]>([]);
  const [trendView, setTrendView] = useState<'income' | 'expense' | 'all'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, catRes, trendRes, activityRes] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getCategoryTotals(),
          dashboardApi.getMonthlyTrends(),
          dashboardApi.getRecentActivity()
        ]);

        setSummary(sumRes.data.summary);
        setCategories(catRes.data.categories);
        setTrends(trendRes.data.months);
        setRecent(activityRes.data.activity);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  // Viewers only see recent activity and a simple message (as per common RBAC)
  // But for this project, let's allow Analyst+ to see full charts.

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Income" 
          value={summary?.total_income || 0} 
          icon={TrendingUp} 
          color="text-income" 
          trend="+12.5%" 
        />
        <StatCard 
          title="Total Expenses" 
          value={summary?.total_expenses || 0} 
          icon={TrendingDown} 
          color="text-expense" 
          trend="-4.2%" 
        />
        <StatCard 
          title="Net Balance" 
          value={summary?.net_balance || 0} 
          icon={Wallet} 
          color="text-primary" 
          trend="+8.1%" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 glass-card p-8 flex flex-col min-h-[480px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Monthly Trends</h2>
              <p className="text-sm text-text-secondary">Cashflow analysis for the last 12 months</p>
            </div>
            <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-wider">
               <button 
                 onClick={() => setTrendView('income')}
                 className={`px-3 py-1.5 rounded transition-all ${trendView === 'income' ? 'bg-income/20 text-income' : 'text-text-secondary hover:text-white'}`}
               >
                 Income
               </button>
               <button 
                 onClick={() => setTrendView('expense')}
                 className={`px-3 py-1.5 rounded transition-all ${trendView === 'expense' ? 'bg-expense/20 text-expense' : 'text-text-secondary hover:text-white'}`}
               >
                 Expense
               </button>
               <button 
                 onClick={() => setTrendView('all')}
                 className={`px-3 py-1.5 rounded transition-all ${trendView === 'all' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-white'}`}
               >
                 Both
               </button>
            </div>
          </div>

          <div className="flex-1 w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                  tickFormatter={(val) => {
                    const [y, m] = val.split('-');
                    const date = new Date(parseInt(y), parseInt(m) - 1);
                    return date.toLocaleString('en-US', { month: 'short' });
                  }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                {(trendView === 'income' || trendView === 'all') && (
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10B981" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                  />
                )}
                {(trendView === 'expense' || trendView === 'all') && (
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#EF4444" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 glass-card p-8 flex flex-col min-h-[440px] space-y-8">
           {(() => {
              const income = Number(summary?.total_income || 0);
              const balance = Number(summary?.net_balance || 0);
              const score = income > 0 ? Math.max(0, Math.min(100, Math.round((balance / income) * 100))) : 0;
              const status = score > 70 ? 'Excellent' : score > 40 ? 'Good' : 'Critical';
              const statusColor = score > 70 ? 'text-income' : score > 40 ? 'text-primary' : 'text-expense';
              const barColor = score > 70 ? 'bg-income' : score > 40 ? 'bg-primary' : 'bg-expense';

              return (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-6">Financial Health</h2>
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`text-4xl font-black ${statusColor} leading-none`}>{score}%</span>
                      <span className="text-xs text-text-secondary leading-tight">{status} status</span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                       <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${score}%` }} />
                    </div>
                  </div>

                  <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-md">
                       <ArrowUpRight className="text-primary" size={20} />
                       Growth Strategy
                    </h3>
                    <p className="text-sm text-primary/80 leading-relaxed font-medium">
                       {score > 70 
                         ? `Your savings rate is currently ${score}% higher than your average monthly burn. This is a great time to diversify your investments.`
                         : score > 40
                         ? `Maintain your current pace! Reducing "Other" expenses by just 5% could push your health score into the "Excellent" zone.`
                         : `Alert: Expenses are consuming ${(100-score)}% of your income. We recommend reviewing your high-priority categories immediately.`
                       }
                    </p>
                  </div>
                </>
              );
           })()}

           <Link 
             to="/records" 
             className="w-full btn-primary !py-5 flex items-center justify-center gap-3 text-sm font-black tracking-widest uppercase mt-auto"
           >
             <Activity size={20} />
             Review Analytics
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 flex flex-col min-h-[520px]">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <button className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
                View All <ChevronRight size={16} />
              </button>
           </div>
           
           <div className="space-y-2 overflow-hidden">
              {recent.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 group">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        item.type === 'income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
                      }`}>
                         <Activity size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-primary transition-colors">{item.category}</h4>
                        <p className="text-xs text-text-secondary">{item.date} • {item.notes || 'No description'}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`font-black text-lg ${item.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        {item.type === 'income' ? '+' : '-'} ₹{Number(item.amount).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Standard</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-1 glass-card p-8 flex flex-col min-h-[520px]">
          <h2 className="text-xl font-bold text-white mb-2">Expenses by Category</h2>
          <p className="text-sm text-text-secondary mb-6">Top spending categories this year</p>
          
          <div className="flex-1 w-full h-[320px] mb-8 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories.filter(c => c.type === 'expense').map(c => ({...c, total: Number(c.total)}))}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={110}
                  paddingAngle={1}
                  dataKey="total"
                  nameKey="category"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={1}
                >
                  {categories.filter(c => c.type === 'expense').map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:brightness-125 transition-all outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<SimplePieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            {categories.filter(c => c.type === 'expense').slice(0, 3).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-medium text-white">{cat.category}</span>
                </div>
                <span className="text-sm font-bold text-white">₹{Number(cat.total).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="glass-card p-8 glass-card-hover group">
    <div className="flex items-center justify-between mb-4">
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 ${color} group-hover:scale-110 transition-transform`}>
           <Icon size={24} />
       </div>
       <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-text-secondary">
          {trend}
       </div>
    </div>
    <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
    <h3 className="text-3xl font-black text-white tracking-tight">₹{Number(value).toLocaleString('en-IN')}</h3>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border border-white/10 shadow-2xl backdrop-blur-2xl">
        <p className="text-xs font-black text-text-secondary mb-3 uppercase tracking-widest">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
               <span className="text-xs font-bold" style={{ color: entry.color }}>{entry.name}:</span>
               <span className="text-sm font-black text-white">₹{Number(entry.value).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const SimplePieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/10 shadow-2xl">
        <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{payload[0].name}</p>
        <p className="text-sm font-bold text-primary">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default Dashboard;
