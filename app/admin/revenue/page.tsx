'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Header from '@/components/shared/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Line = dynamic(() => import('react-chartjs-2').then((m) => m.Line), {
  ssr: false,
});
const Bar = dynamic(() => import('react-chartjs-2').then((m) => m.Bar), {
  ssr: false,
});

interface RevenuePoint {
  label: string;
  amount: number;
  cost: number;
  profit: number;
  loss: number;
  count: number;
  users: number;
}

interface UsersVendorsPoint {
  label: string;
  users: number;
  vendors: number;
}

type Range = 'weekly' | 'monthly' | 'yearly';
type Metric = 'amount' | 'profit' | 'loss';

export default function RevenueAnalyticsPage() {
  const { data: session, status } = useSession();
  const [range, setRange] = useState<Range>('monthly');
  const [metric, setMetric] = useState<Metric>('amount');
  const [revData, setRevData] = useState<RevenuePoint[]>([]);
  const [uvData, setUvData] = useState<UsersVendorsPoint[]>([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalVendors: 0,
    revenue: 0,
    profit: 0,
    loss: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = async (currentRange: Range) => {
    try {
      setLoading(true);
      setError('');

      const [summaryRes, revRes, uvRes] = await Promise.all([
        fetch('/api/admin/summary'),
        fetch(`/api/admin/revenue?range=${currentRange}`),
        fetch(`/api/admin/users-vendors?range=${currentRange}`),
      ]);
      console.log('revenue fetch done',revRes)

      if (!summaryRes.ok || !revRes.ok || !uvRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const summaryJson = await summaryRes.json();
      const revJson = await revRes.json();
      const uvJson = await uvRes.json();

      setSummary(summaryJson.data);
      setRevData(revJson.data || []);
      setUvData(uvJson.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch analytics data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      fetchAll(range);
    } else if (status === 'authenticated') {
      setError('You must be an admin to access this page');
      setLoading(false);
    }
  }, [status, session, range]);

  const safeRev = revData.length
    ? revData
    : [
        {
          label: 'No data',
          amount: 0,
          cost: 0,
          profit: 0,
          loss: 0,
          count: 0,
          users: 0,
        },
      ];

  const safeUv = uvData.length
    ? uvData
    : [{ label: 'No data', users: 0, vendors: 0 }];

  const labels = safeRev.map((d) => d.label);

  const primaryValues =
    metric === 'amount'
      ? safeRev.map((d) => d.amount)
      : metric === 'profit'
      ? safeRev.map((d) => d.profit)
      : safeRev.map((d) => d.loss);

  const primaryLabel =
    metric === 'amount'
      ? 'Revenue'
      : metric === 'profit'
      ? 'Profit'
      : 'Loss';

  const primaryColor =
    metric === 'amount'
      ? '#16a34a'
      : metric === 'profit'
      ? '#2563eb'
      : '#dc2626';
  const primaryBg =
    metric === 'amount'
      ? 'rgba(22,163,74,0.15)'
      : metric === 'profit'
      ? 'rgba(37,99,235,0.15)'
      : 'rgba(220,38,38,0.15)';

  const lineData = {
    labels,
    datasets: [
      {
        label: `${primaryLabel} (${range})`,
        data: primaryValues,
        borderColor: primaryColor,
        backgroundColor: primaryBg,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const barData = {
    labels: safeUv.map((d) => d.label),
    datasets: [
      {
        label: 'Users',
        data: safeUv.map((d) => d.users),
        backgroundColor: 'rgba(37,99,235,0.7)',
      },
      {
        label: 'Vendors',
        data: safeUv.map((d) => d.vendors),
        backgroundColor: 'rgba(234,179,8,0.9)',
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: { ticks: { autoSkip: true, maxTicksLimit: 12 } },
      y: { beginAtZero: true },
    },
  };

  const totals = useMemo(() => {
    const totalAmount = revData.reduce((s, d) => s + d.amount, 0);
    const totalProfit = revData.reduce((s, d) => s + d.profit, 0);
    const totalLoss = revData.reduce((s, d) => s + d.loss, 0);
    return { totalAmount, totalProfit, totalLoss };
  }, [revData]);

  const growthRevenue =
    totals.totalAmount && summary.revenue
      ? ((totals.totalAmount - summary.revenue) / (summary.revenue || 1)) * 100
      : 0;

  if (status === 'loading' || loading) {
    return (
      <div>
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (!session || (session?.user as any)?.role !== 'admin') {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold mb-2">
              Admin Access Required
            </h1>
            <p className="text-gray-600">
              You must be an admin to access this page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-1">
              Revenue Analytics
            </h1>
            <p className="text-gray-600">
              Track revenue, profit, loss, users, and vendors over time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['weekly', 'monthly', 'yearly'] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  range === r
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => fetchAll(range)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="card">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Total Users
            </p>
            <p className="mt-1 text-2xl font-display font-bold">
              {summary.totalUsers}
            </p>
          </div>
          <div className="card">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Total Vendors
            </p>
            <p className="mt-1 text-2xl font-display font-bold">
              {summary.totalVendors}
            </p>
          </div>
          <div className="card flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Revenue
              </p>
              <p className="mt-1 text-2xl font-display font-bold">
                ₹{summary.revenue}
              </p>
            </div>
            <div className="rounded-full bg-green-50 p-2 text-green-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="card">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Profit / Loss
            </p>
            <p className="mt-1 text-lg font-display font-bold text-green-600">
              Profit: ₹{summary.profit}
            </p>
            <p className="text-sm text-red-500">Loss: ₹{summary.loss}</p>
          </div>
        </div>

        {/* Metric selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold">
            Performance over time
          </h2>
          <div className="inline-flex items-center gap-2 text-xs">
            <span className="text-gray-500">Metric:</span>
            {(['amount', 'profit', 'loss'] as Metric[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`px-3 py-1 rounded-full border ${
                  metric === m
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {m === 'amount'
                  ? 'Revenue'
                  : m === 'profit'
                  ? 'Profit'
                  : 'Loss'}
              </button>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card h-[340px]">
            <Line data={lineData} options={commonOptions} />
          </div>
          <div className="card h-[340px]">
            <Bar data={barData} options={commonOptions} />
          </div>
        </div>

        {/* Growth indicator */}
        <p className="text-xs text-gray-500">
          Approx revenue growth vs summary total: {growthRevenue.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}