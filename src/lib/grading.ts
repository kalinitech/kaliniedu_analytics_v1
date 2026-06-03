export interface GradeThreshold {
  min: number;
  max: number;
  grade: string;
  points?: number;
}

export function getGrade(score: number, thresholds: GradeThreshold[]): string {
  for (const t of thresholds) {
    if (score >= t.min && score <= t.max) return t.grade;
  }
  return 'N/A';
}

export function getGradePoints(score: number, thresholds: GradeThreshold[]): number {
  for (const t of thresholds) {
    if (score >= t.min && score <= t.max) return t.points || 0;
  }
  return 0;
}

// CBC thresholds (Competency Based Curriculum - Kenya primary)
export const CBC_THRESHOLDS: GradeThreshold[] = [
  { min: 90, max: 100, grade: 'EE1', points: 12 },
  { min: 75, max: 89, grade: 'EE2', points: 11 },
  { min: 58, max: 74, grade: 'ME1', points: 10 },
  { min: 41, max: 57, grade: 'ME2', points: 9 },
  { min: 31, max: 40, grade: 'AE1', points: 8 },
  { min: 21, max: 30, grade: 'AE2', points: 7 },
  { min: 11, max: 20, grade: 'BE1', points: 6 },
  { min: 0, max: 10, grade: 'BE2', points: 5 },
];

// KCSE thresholds (Kenya Certificate of Secondary Education)
export const KCSE_THRESHOLDS: GradeThreshold[] = [
  { min: 81, max: 100, grade: 'A', points: 12 },
  { min: 75, max: 80, grade: 'A-', points: 11 },
  { min: 69, max: 74, grade: 'B+', points: 10 },
  { min: 61, max: 68, grade: 'B', points: 9 },
  { min: 54, max: 60, grade: 'B-', points: 8 },
  { min: 48, max: 53, grade: 'C+', points: 7 },
  { min: 42, max: 47, grade: 'C', points: 6 },
  { min: 36, max: 41, grade: 'C-', points: 5 },
  { min: 30, max: 35, grade: 'D+', points: 4 },
  { min: 24, max: 29, grade: 'D', points: 3 },
  { min: 18, max: 23, grade: 'D-', points: 2 },
  { min: 0, max: 17, grade: 'E', points: 1 },
];

export function getThresholdsBySystem(systemName: string): GradeThreshold[] {
  switch (systemName) {
    case 'CBC':
      return CBC_THRESHOLDS;
    case 'KCSE':
      return KCSE_THRESHOLDS;
    default:
      return CBC_THRESHOLDS;
  }
}

export function calculateMeanGrade(
  subjectScores: number[],
  thresholds: GradeThreshold[]
): string {
  if (subjectScores.length === 0) return 'N/A';
  const totalPoints = subjectScores.reduce(
    (sum, score) => sum + getGradePoints(score, thresholds),
    0
  );
  const meanPoints = totalPoints / subjectScores.length;
  // Find the grade that corresponds to the mean points
  for (const t of thresholds) {
    if (t.points !== undefined && Math.round(meanPoints) >= t.points) {
      return t.grade;
    }
  }
  return 'N/A';
}

export function calculateClassAnalytics(
  students: Array<Record<string, number | string>>,
  subjectKeys: string[],
  thresholds: GradeThreshold[]
) {
  const totalStudents = students.length;
  if (totalStudents === 0) {
    return {
      totalStudents: 0,
      classMeanScore: 0,
      classMeanGrade: 'N/A',
      subjectMeans: [],
      gradeDistribution: {},
      topFive: [],
      bottomFive: [],
      bestSubject: '',
      worstSubject: '',
    };
  }

  // Subject means
  const subjectMeans: Array<{ subject: string; mean: number; grade: string }> = [];
  for (const key of subjectKeys) {
    const scores = students
      .map((s) => Number(s[key]))
      .filter((v) => !isNaN(v) && v >= 0);
    if (scores.length > 0) {
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      subjectMeans.push({
        subject: key,
        mean: Math.round(mean * 100) / 100,
        grade: getGrade(mean, thresholds),
      });
    }
  }

  // Class mean score
  const allScores = students
    .map((s) => {
      const scores = subjectKeys
        .map((k) => Number(s[k]))
        .filter((v) => !isNaN(v) && v >= 0);
      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    })
    .filter((v) => v > 0);
  const classMeanScore =
    allScores.length > 0
      ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 100) / 100
      : 0;
  const classMeanGrade = getGrade(classMeanScore, thresholds);

  // Grade distribution
  const gradeDistribution: Record<string, number> = {};
  for (const t of thresholds) {
    gradeDistribution[t.grade] = 0;
  }
  for (const student of students) {
    const scores = subjectKeys
      .map((k) => Number(student[k]))
      .filter((v) => !isNaN(v) && v >= 0);
    if (scores.length > 0) {
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const grade = getGrade(mean, thresholds);
      if (gradeDistribution[grade] !== undefined) {
        gradeDistribution[grade]++;
      }
    }
  }

  // Sort students by total for top/bottom
  const sortedStudents = [...students].sort((a, b) => {
    const totalA = subjectKeys.reduce((sum, k) => sum + (Number(a[k]) || 0), 0);
    const totalB = subjectKeys.reduce((sum, k) => sum + (Number(b[k]) || 0), 0);
    return totalB - totalA;
  });

  const topFive = sortedStudents.slice(0, 5).map((s) => ({
    name: String(s.NAME || s.Name || s.name || 'Unknown'),
    total: subjectKeys.reduce((sum, k) => sum + (Number(s[k]) || 0), 0),
  }));

  const bottomFive = sortedStudents
    .slice(-5)
    .reverse()
    .map((s) => ({
      name: String(s.NAME || s.Name || s.name || 'Unknown'),
      total: subjectKeys.reduce((sum, k) => sum + (Number(s[k]) || 0), 0),
    }));

  // Best and worst subjects
  let bestSubject = '';
  let worstSubject = '';
  let bestMean = -1;
  let worstMean = Infinity;
  for (const sm of subjectMeans) {
    if (sm.mean > bestMean) {
      bestMean = sm.mean;
      bestSubject = sm.subject;
    }
    if (sm.mean < worstMean) {
      worstMean = sm.mean;
      worstSubject = sm.subject;
    }
  }

  return {
    totalStudents,
    classMeanScore,
    classMeanGrade,
    subjectMeans,
    gradeDistribution,
    topFive,
    bottomFive,
    bestSubject,
    worstSubject,
  };
}
