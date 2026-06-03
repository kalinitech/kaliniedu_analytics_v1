export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { processExcelFile, generateResultWorkbook, workbookToBuffer } from '@/lib/excelProcessor';
import { DEFAULT_FREE_PLAN, checkFileSize, checkStudentLimit } from '@/lib/planFeatures';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const gradingSystem = (formData.get('gradingSystem') as string) || 'CBC';
    const downloadOnly = formData.get('downloadOnly') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // For free/unauthenticated users, use default free plan limits
    const plan = DEFAULT_FREE_PLAN;

    // Check file size
    const sizeCheck = checkFileSize(file.size, plan);
    if (!sizeCheck.allowed) {
      return NextResponse.json({ error: sizeCheck.message }, { status: 403 });
    }

    // Read file buffer
    const fileBuffer = await file.arrayBuffer();

    // Process the Excel file
    const result = processExcelFile(fileBuffer, gradingSystem);

    if (result.students.length === 0) {
      return NextResponse.json(
        { error: 'No student data found in the file. Please check the format.' },
        { status: 400 }
      );
    }

    // Check student limit
    const studentCheck = checkStudentLimit(result.students.length, plan);
    if (!studentCheck.allowed) {
      return NextResponse.json({ error: studentCheck.message }, { status: 403 });
    }

    // If download only, return the Excel file
    if (downloadOnly) {
      const workbook = generateResultWorkbook(result);
      const buffer = workbookToBuffer(workbook);

      return new NextResponse(buffer, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${file.name.replace(/\.[^/.]+$/, '')}_graded.xlsx"`,
        },
      });
    }

    // Return processed data as JSON
    return NextResponse.json({
      result: {
        students: result.students,
        subjectKeys: result.subjectKeys,
        analytics: result.analytics,
        gradingSystem: result.gradingSystem,
      },
    });
  } catch (err) {
    console.error('Upload processing error:', err);
    const message = err instanceof Error ? err.message : 'Failed to process file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
