'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onProcessComplete: (result: ProcessResult) => void;
  onProcessing: (processing: boolean) => void;
}

export interface ProcessResult {
  students: Array<Record<string, string | number>>;
  subjectKeys: string[];
  analytics: {
    totalStudents: number;
    classMeanScore: number;
    classMeanGrade: string;
    subjectMeans: Array<{ subject: string; mean: number; grade: string }>;
    gradeDistribution: Record<string, number>;
    topFive: Array<{ name: string; total: number }>;
    bottomFive: Array<{ name: string; total: number }>;
    bestSubject: string;
    worstSubject: string;
  };
  gradingSystem: string;
  excelBuffer?: ArrayBuffer;
}

export function FileUpload({ onProcessComplete, onProcessing }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [gradingSystem, setGradingSystem] = useState<string>('CBC');
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    setError('');
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setError('Please upload an Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    onProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('gradingSystem', gradingSystem);

      const response = await fetch('/api/process-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process file');
        toast({
          title: 'Processing Failed',
          description: data.error || 'Failed to process file',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Processing Complete',
        description: `Successfully processed ${data.result.students.length} students`,
        variant: 'default',
      });

      onProcessComplete(data.result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      onProcessing(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('gradingSystem', gradingSystem);
      formData.append('downloadOnly', 'true');

      const response = await fetch('/api/process-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        toast({ title: 'Download Failed', variant: 'destructive' });
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name.replace(/\.[^/.]+$/, '') + '_graded.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast({ title: 'Download Failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Grading System
          </label>
          <Select value={gradingSystem} onValueChange={setGradingSystem}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select grading system" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CBC">CBC (Competency Based Curriculum)</SelectItem>
              <SelectItem value="KCSE">KCSE (Secondary School)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card
        className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
          dragActive
            ? 'border-turquoise-500 bg-turquoise-50'
            : selectedFile
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-turquoise-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-10">
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />

          {selectedFile ? (
            <>
              <FileSpreadsheet className="h-12 w-12 text-green-500 mb-3" />
              <p className="text-sm font-medium text-green-700">{selectedFile.name}</p>
              <p className="text-xs text-green-600 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
              <p className="text-xs text-gray-500 mt-2">Click or drag to replace</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                Drag & drop your marksheet here
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or click to browse (.xlsx, .xls, .csv)
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleProcess}
          disabled={!selectedFile}
          className="flex-1 bg-turquoise-500 hover:bg-turquoise-600 text-white"
        >
          {!selectedFile ? (
            'Select a file to process'
          ) : (
            <>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Process & Grade Marks
            </>
          )}
        </Button>

        {selectedFile && (
          <Button
            onClick={handleDownloadExcel}
            variant="outline"
            className="border-turquoise-500 text-turquoise-600 hover:bg-turquoise-50"
          >
            Download Excel
          </Button>
        )}
      </div>
    </div>
  );
}
