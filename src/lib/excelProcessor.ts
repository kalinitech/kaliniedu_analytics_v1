import * as XLSX from 'xlsx';
import {
  GradeThreshold,
  getGrade,
  getGradePoints,
  calculateClassAnalytics,
  getThresholdsBySystem,
} from './grading';

export interface ProcessedStudent {
  [key: string]: string | number;
}

export interface ProcessResult {
  students: ProcessedStudent[];
  subjectKeys: string[];
  analytics: ReturnType<typeof calculateClassAnalytics>;
  gradingSystem: string;
}

// Known subject column prefixes for auto-detection
const SUBJECT_PATTERNS = [
  'ENG', 'KSW', 'MATH', 'KISW', 'SCI', 'SOC', 'CRE', 'IRE',
  'HRE', 'MUS', 'PE', 'ART', 'COMP', 'FRE', 'GER', 'ARA',
  'BIO', 'PHY', 'CHEM', 'HIST', 'GEO', 'AGRI', 'BUS', 'COMP',
  'ENG_LIT', 'HOME_SCI', 'WOODWORK', 'METALWORK', 'BUILDING',
  'ELEC', 'POWER', 'AVIATION', 'FRENCH', 'GERMAN', 'ARABIC',
  'MUSIC', 'DRAMA', 'DANCE', 'VISUAL_ART',
];

/**
 * Detect if a column name represents a subject score
 */
function isSubjectColumn(colName: string): boolean {
  const upper = colName.toUpperCase().trim();
  // Skip NAME, TOTAL, RBC, RNK, RANK columns
  if (['NAME', 'TOTAL', 'RBC', 'RNK', 'RANK', 'AVERAGE', 'MEAN', 'GRADE', 'REMARKS'].includes(upper)) {
    return false;
  }
  // Check if it starts with a known subject code
  for (const pattern of SUBJECT_PATTERNS) {
    if (upper.startsWith(pattern)) return true;
  }
  // Check if it looks like a percentage column (%P1, %P2, etc.)
  if (upper.match(/^%?\w*\d+$/)) return true;
  // Check if column contains numeric data
  return false;
}

/**
 * Find matching base columns for dual-column detection (%P1/%P2 pattern)
 */
function findDualColumns(columns: string[]): Map<string, string[]> {
  const dualMap = new Map<string, string[]>();
  const pattern = /^(.+?)[-_]?(?:P|p|OP|op|TEST|test|EXAM|exam)?(\d+)$/;

  for (const col of columns) {
    const match = col.match(pattern);
    if (match) {
      const base = match[1].toUpperCase().trim();
      if (!dualMap.has(base)) {
        dualMap.set(base, []);
      }
      dualMap.get(base)!.push(col);
    }
  }

  // Filter to only keep bases that have multiple columns
  const result = new Map<string, string[]>();
  for (const [base, cols] of dualMap) {
    if (cols.length >= 2) {
      result.set(base, cols);
    }
  }
  return result;
}

/**
 * Process an Excel file buffer and produce graded results
 */
export function processExcelFile(
  fileBuffer: ArrayBuffer,
  gradingSystemName: string = 'CBC',
  customThresholds?: GradeThreshold[]
): ProcessResult {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const rawData: Record<string, string | number>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: 0,
  });

  if (rawData.length === 0) {
    return {
      students: [],
      subjectKeys: [],
      analytics: {
        totalStudents: 0,
        classMeanScore: 0,
        classMeanGrade: 'N/A',
        subjectMeans: [],
        gradeDistribution: {},
        topFive: [],
        bottomFive: [],
        bestSubject: '',
        worstSubject: '',
      },
      gradingSystem: gradingSystemName,
    };
  }

  // Get column names
  const columns = Object.keys(rawData[0]);

  // Normalize column names
  const normalizedData = rawData.map((row) => {
    const normalizedRow: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = key.trim().toUpperCase();
      normalizedRow[normalizedKey] = value;
    }
    return normalizedRow;
  });

  // Get normalized columns
  const normalizedColumns = Object.keys(normalizedData[0]);

  // Find NAME column
  const nameColumn = normalizedColumns.find((col) =>
    ['NAME', 'STUDENT NAME', 'STUDENT', 'PUPIL', 'LEARNER', 'FULL NAME'].includes(col.toUpperCase())
  ) || normalizedColumns[0];

  // Find subject columns
  const subjectColumns = normalizedColumns.filter((col) => {
    if (col === nameColumn) return false;
    // Check if the column has numeric values
    const values = normalizedData.map((row) => Number(row[col])).filter((v) => !isNaN(v));
    return values.length > 0 && isSubjectColumn(col);
  });

  // If no subject columns detected by pattern, use all numeric columns except name
  const finalSubjectColumns =
    subjectColumns.length > 0
      ? subjectColumns
      : normalizedColumns.filter((col) => {
          if (col === nameColumn) return false;
          const values = normalizedData.map((row) => Number(row[col])).filter((v) => !isNaN(v));
          return values.length > normalizedData.length * 0.5;
        });

  // Detect dual columns (%P1/%P2 pattern)
  const dualColumns = findDualColumns(finalSubjectColumns);

  // Calculate averaged columns for dual columns
  const processedStudents: ProcessedStudent[] = normalizedData.map((row) => {
    const student: ProcessedStudent = {
      NAME: String(row[nameColumn] || 'Unknown'),
    };

    const subjectScores: number[] = [];

    for (const col of finalSubjectColumns) {
      // Check if this column is part of a dual column set
      let isPartOfDual = false;
      for (const [base, cols] of dualColumns) {
        if (cols.includes(col)) {
          isPartOfDual = true;
          // Only process on the first column of the pair
          if (cols[0] === col) {
            const values = cols.map((c) => Number(row[c]) || 0);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            student[base] = Math.round(avg * 100) / 100;
            subjectScores.push(avg);
          }
          break;
        }
      }

      if (!isPartOfDual) {
        const val = Number(row[col]) || 0;
        student[col] = val;
        subjectScores.push(val);
      }
    }

    // Get the actual subject keys used in the student record
    const actualSubjectKeys = Object.keys(student).filter((k) => k !== 'NAME');

    // Calculate TOTAL
    const total = actualSubjectKeys.reduce(
      (sum, key) => sum + (Number(student[key]) || 0),
      0
    );
    student['TOTAL'] = total;

    // Calculate RBC (mean grade)
    const thresholds = customThresholds || getThresholdsBySystem(gradingSystemName);
    const validScores = actualSubjectKeys
      .map((k) => Number(student[k]))
      .filter((v) => !isNaN(v) && v >= 0);

    if (validScores.length > 0) {
      const meanScore = total / validScores.length;
      student['RBC'] = getGrade(meanScore, thresholds);
    } else {
      student['RBC'] = 'N/A';
    }

    return student;
  });

  // Get subject keys (excluding NAME, TOTAL, RBC, RNK)
  const subjectKeys = Object.keys(processedStudents[0] || {}).filter(
    (k) => !['NAME', 'TOTAL', 'RBC', 'RNK'].includes(k)
  );

  // Calculate RNK (rank) based on TOTAL
  const sortedIndices = processedStudents
    .map((s, i) => ({ index: i, total: Number(s.TOTAL) || 0 }))
    .sort((a, b) => b.total - a.total);

  const ranks = new Array(sortedIndices.length);
  let currentRank = 1;
  for (let i = 0; i < sortedIndices.length; i++) {
    if (i > 0 && sortedIndices[i].total < sortedIndices[i - 1].total) {
      currentRank = i + 1;
    }
    ranks[sortedIndices[i].index] = currentRank;
  }

  for (let i = 0; i < processedStudents.length; i++) {
    processedStudents[i]['RNK'] = ranks[i];
  }

  // Calculate class analytics
  const thresholds = customThresholds || getThresholdsBySystem(gradingSystemName);
  const analytics = calculateClassAnalytics(
    processedStudents as Array<Record<string, number | string>>,
    subjectKeys,
    thresholds
  );

  return {
    students: processedStudents,
    subjectKeys,
    analytics,
    gradingSystem: gradingSystemName,
  };
}

/**
 * Generate a processed Excel workbook with results and analytics sheet
 */
export function generateResultWorkbook(result: ProcessResult): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Main results sheet
  const resultHeaders = ['NAME', ...result.subjectKeys, 'TOTAL', 'RBC', 'RNK'];
  const resultData = result.students.map((s) => {
    const row: Record<string, string | number> = {};
    for (const h of resultHeaders) {
      row[h] = s[h] !== undefined ? s[h] : '';
    }
    return row;
  });

  const resultWs = XLSX.utils.json_to_sheet(resultData, { header: resultHeaders });

  // Set column widths
  resultWs['!cols'] = resultHeaders.map((h) => ({
    wch: h === 'NAME' ? 25 : h === 'RBC' ? 8 : 10,
  }));

  XLSX.utils.book_append_sheet(wb, resultWs, 'Results');

  // Class Analytics sheet
  const analyticsRows: Record<string, string | number>[] = [];

  // Summary section
  analyticsRows.push({ Metric: 'Total Students', Value: result.analytics.totalStudents });
  analyticsRows.push({ Metric: 'Class Mean Score', Value: result.analytics.classMeanScore });
  analyticsRows.push({ Metric: 'Class Mean Grade', Value: result.analytics.classMeanGrade });
  analyticsRows.push({ Metric: 'Best Subject', Value: result.analytics.bestSubject });
  analyticsRows.push({ Metric: 'Worst Subject', Value: result.analytics.worstSubject });
  analyticsRows.push({ Metric: '', Value: '' });

  // Subject means section
  analyticsRows.push({ Metric: 'SUBJECT ANALYSIS', Value: '' });
  for (const sm of result.analytics.subjectMeans) {
    analyticsRows.push({
      Metric: `  ${sm.subject}`,
      Value: `Mean: ${sm.mean} (${sm.grade})`,
    });
  }
  analyticsRows.push({ Metric: '', Value: '' });

  // Grade distribution
  analyticsRows.push({ Metric: 'GRADE DISTRIBUTION', Value: '' });
  for (const [grade, count] of Object.entries(result.analytics.gradeDistribution)) {
    if (count > 0) {
      analyticsRows.push({
        Metric: `  ${grade}`,
        Value: `${count} student${count > 1 ? 's' : ''}`,
      });
    }
  }
  analyticsRows.push({ Metric: '', Value: '' });

  // Top 5
  analyticsRows.push({ Metric: 'TOP 5 STUDENTS', Value: '' });
  for (let i = 0; i < result.analytics.topFive.length; i++) {
    analyticsRows.push({
      Metric: `  ${i + 1}. ${result.analytics.topFive[i].name}`,
      Value: result.analytics.topFive[i].total,
    });
  }
  analyticsRows.push({ Metric: '', Value: '' });

  // Bottom 5
  analyticsRows.push({ Metric: 'BOTTOM 5 STUDENTS', Value: '' });
  for (let i = 0; i < result.analytics.bottomFive.length; i++) {
    analyticsRows.push({
      Metric: `  ${i + 1}. ${result.analytics.bottomFive[i].name}`,
      Value: result.analytics.bottomFive[i].total,
    });
  }

  const analyticsWs = XLSX.utils.json_to_sheet(analyticsRows, {
    header: ['Metric', 'Value'],
  });
  analyticsWs['!cols'] = [{ wch: 30 }, { wch: 25 }];

  XLSX.utils.book_append_sheet(wb, analyticsWs, 'Class_Analytics');

  return wb;
}

/**
 * Convert workbook to buffer for download
 */
export function workbookToBuffer(wb: XLSX.WorkBook): ArrayBuffer {
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return buf;
}
