'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  DollarSign,
  Users,
  School,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatKES, formatDate } from '@/lib/utils';

interface Stats {
  totalUploads: number;
  totalRevenue: number;
  activeTeachers: number;
  totalSchools: number;
  monthlyUploads: Array<{ month: string; count: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  recentUploads: Array<{
    id: string;
    file_name: string;
    student_count: number;
    grading_system: string;
    created_at: string;
    users?: { email: string; full_name: string };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch {
      setStats({
        totalUploads: 0,
        totalRevenue: 0,
        activeTeachers: 0,
        totalSchools: 0,
        monthlyUploads: [],
        monthlyRevenue: [],
        recentUploads: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-turquoise-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const hasUploadData = stats?.monthlyUploads && stats.monthlyUploads.length > 0;
  const hasRevenueData = stats?.monthlyRevenue && stats.monthlyRevenue.some((m) => m.revenue > 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your KalinEdu Analytics platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-turquoise-50 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-turquoise-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Files Analysed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalUploads || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalRevenue ? formatKES(stats.totalRevenue) : 'KES 0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-navy-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-navy-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Teachers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.activeTeachers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <School className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Schools</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalSchools || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Uploads Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-turquoise-500" />
              Monthly Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasUploadData ? (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={stats.monthlyUploads}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value: string) => value.split(' ')[0]}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#00B4D8" radius={[4, 4, 0, 0]} name="Uploads" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No upload data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Monthly Revenue (KES)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasRevenueData ? (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value: string) => value.split(' ')[0]}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatKES(value), 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentUploads && stats.recentUploads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentUploads.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell className="font-medium">{upload.file_name}</TableCell>
                    <TableCell>{upload.users?.full_name || upload.users?.email || '—'}</TableCell>
                    <TableCell>{upload.student_count}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {upload.grading_system}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(upload.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              No uploads yet. Data will appear here once teachers start processing marksheets.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
