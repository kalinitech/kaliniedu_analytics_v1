'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  GraduationCap,
  FileSpreadsheet,
  Download,
  Star,
  CheckCircle,
  Users,
  BookOpen,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileUpload, type ProcessResult } from '@/components/FileUpload';

export default function HomePage() {
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcessComplete = (data: ProcessResult) => {
    setResult(data);
  };

  const handleDownloadExcel = async () => {
    if (!result) return;

    // Re-process and download
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('gradingSystem', result.gradingSystem);
      formData.append('downloadOnly', 'true');

      const response = await fetch('/api/process-upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/\.[^/.]+$/, '') + '_graded.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-turquoise-500 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-navy-700 leading-tight">
                  KalinEdu
                </h1>
                <p className="text-[10px] text-turquoise-500 -mt-0.5 leading-tight">
                  Analytics
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="text-sm font-medium text-gray-600 hover:text-turquoise-600 transition-colors"
              >
                Pricing
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="sm" className="text-xs">
                  Admin
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!result && (
        <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-turquoise-700">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="bg-turquoise-500/20 text-turquoise-300 border-turquoise-500/30 mb-6">
                <Zap className="h-3 w-3 mr-1" />
                Powered for Kenyan Schools
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Transform Your Marksheet Into{' '}
                <span className="text-turquoise-400">Instant Analytics</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Upload your Excel marksheet and get automated grading, class rankings,
                subject analysis, and professional reports — in seconds.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-turquoise-400" />
                  CBC & KCSE Grading
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-turquoise-400" />
                  Auto-Detect Subjects
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-turquoise-400" />
                  Excel & PDF Reports
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid (only shown before upload) */}
      {!result && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-turquoise-50 flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="h-6 w-6 text-turquoise-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Upload & Process</h3>
                  <p className="text-sm text-gray-500">
                    Drag & drop your Excel marksheet. We auto-detect student names,
                    subjects, and dual exam columns.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-6 w-6 text-navy-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Auto-Grade & Rank</h3>
                  <p className="text-sm text-gray-500">
                    Automatically calculate totals, apply CBC/KCSE grading,
                    and rank students by performance.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-turquoise-50 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-6 w-6 text-turquoise-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
                  <p className="text-sm text-gray-500">
                    Get subject means, grade distribution, top/bottom performers,
                    and download professional Excel reports.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Upload Section */}
      <section className="py-12" id="upload">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upload Your Marksheet
            </h2>
            <p className="text-gray-500">
              {result
                ? 'Upload another file or download your results below'
                : 'Select your grading system and upload an Excel file to get started'}
            </p>
          </div>

          <FileUpload
            onProcessComplete={handleProcessComplete}
            onProcessing={setProcessing}
          />

          {processing && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-turquoise-600">
                <div className="animate-spin h-4 w-4 border-2 border-turquoise-500 border-t-transparent rounded-full" />
                Processing your marksheet...
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Analytics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-turquoise-50 flex items-center justify-center">
                      <Users className="h-5 w-5 text-turquoise-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Students</p>
                      <p className="text-xl font-bold text-gray-900">
                        {result.analytics.totalStudents}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-navy-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Class Mean</p>
                      <p className="text-xl font-bold text-gray-900">
                        {result.analytics.classMeanScore}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <Star className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mean Grade</p>
                      <p className="text-xl font-bold text-gray-900">
                        {result.analytics.classMeanGrade}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Subjects</p>
                      <p className="text-xl font-bold text-gray-900">
                        {result.subjectKeys.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Subject Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.analytics.subjectMeans.map((sm) => (
                      <div
                        key={sm.subject}
                        className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {sm.subject}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{sm.mean}</span>
                          <Badge
                            variant="outline"
                            className="text-xs border-turquoise-300 text-turquoise-600"
                          >
                            {sm.grade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Grade Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(result.analytics.gradeDistribution)
                      .filter(([, count]) => count > 0)
                      .sort(([, a], [, b]) => b - a)
                      .map(([grade, count]) => (
                        <div key={grade} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 w-10">
                            {grade}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                            <div
                              className="bg-turquoise-500 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(
                                  (count / result.analytics.totalStudents) * 100,
                                  2
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top & Bottom Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-green-700">
                    ⭐ Top 5 Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.analytics.topFive.map((student, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-green-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {student.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          {student.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-red-700">
                    ⚠️ Bottom 5 Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.analytics.bottomFive.map((student, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-red-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">
                            {result.analytics.totalStudents - i}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {student.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-red-600">
                          {student.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Table */}
            <Card className="border-0 shadow-sm mb-8">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Student Results
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownloadExcel}
                      size="sm"
                      className="bg-turquoise-500 hover:bg-turquoise-600 text-white"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="w-12">RNK</TableHead>
                        <TableHead>NAME</TableHead>
                        {result.subjectKeys.map((key) => (
                          <TableHead key={key} className="text-center">
                            {key}
                          </TableHead>
                        ))}
                        <TableHead className="text-center font-bold">TOTAL</TableHead>
                        <TableHead className="text-center">RBC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.students
                        .sort((a, b) => (Number(a.RNK) || 0) - (Number(b.RNK) || 0))
                        .map((student, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {String(student.RNK)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {String(student.NAME)}
                            </TableCell>
                            {result.subjectKeys.map((key) => (
                              <TableCell key={key} className="text-center">
                                {student[key]}
                              </TableCell>
                            ))}
                            <TableCell className="text-center font-bold">
                              {student.TOTAL}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="text-xs border-turquoise-300 text-turquoise-600"
                              >
                                {String(student.RBC)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Best/Worst Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Card className="border-l-4 border-l-green-500 border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Best Performing Subject</p>
                  <p className="text-lg font-bold text-green-700">
                    {result.analytics.bestSubject}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500 border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Worst Performing Subject</p>
                  <p className="text-lg font-bold text-red-700">
                    {result.analytics.worstSubject}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Grading System Info */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 text-center">
                  Graded using <strong>{result.gradingSystem}</strong> grading system •
                  Powered by{' '}
                  <strong className="text-turquoise-600">KALINITECH SYSTEMS</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-turquoise-500 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">KalinEdu Analytics</p>
                <p className="text-xs text-gray-400">by KALINITECH SYSTEMS</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/pricing" className="hover:text-turquoise-400 transition-colors">
                Pricing
              </Link>
              <Link href="/admin" className="hover:text-turquoise-400 transition-colors">
                Admin
              </Link>
              <a
                href="mailto:kalinimedia001@gmail.com"
                className="hover:text-turquoise-400 transition-colors"
              >
                Support
              </a>
            </div>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Kalinitech Systems. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
