/**
 * Date Handling Diagnostic Tool
 * 
 * Use this utility to debug date issues in development or production.
 * Import and call `diagnoseDateHandling()` to get a comprehensive report.
 */

import { formatDate, formatDateTime, isValidDate, parseDate } from './date';

export interface DateDiagnosticResult {
  testCase: string;
  input: any;
  isValid: boolean;
  formatted: string;
  formattedWithTime: string;
  parsed: Date | null;
  issues: string[];
  recommendations: string[];
}

/**
 * Test a single date value and return diagnostic information
 */
export function diagnoseSingleDate(
  testCase: string,
  dateValue: any
): DateDiagnosticResult {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if date is valid
  const isValid = isValidDate(dateValue);
  if (!isValid && dateValue !== null && dateValue !== undefined) {
    issues.push('Date is invalid or cannot be parsed');
    recommendations.push('Ensure backend returns ISO 8601 format (e.g., "2026-01-10T16:03:29.667Z")');
  }

  // Check for null/undefined
  if (dateValue === null) {
    issues.push('Date is null');
    recommendations.push('This will display as "N/A" - ensure this is intentional');
  }
  if (dateValue === undefined) {
    issues.push('Date is undefined');
    recommendations.push('Check if the field exists in the API response');
  }

  // Check for empty object (common bug)
  if (typeof dateValue === 'object' && dateValue !== null && !(dateValue instanceof Date)) {
    if (Object.keys(dateValue).length === 0) {
      issues.push('Date is an empty object {}');
      recommendations.push('Backend serialization issue - use .lean() and toISOString()');
    }
  }

  // Get formatted outputs
  const formatted = formatDate(dateValue);
  const formattedWithTime = formatDateTime(dateValue);
  const parsed = parseDate(dateValue);

  return {
    testCase,
    input: dateValue,
    isValid,
    formatted,
    formattedWithTime,
    parsed,
    issues,
    recommendations,
  };
}

/**
 * Run comprehensive date handling diagnostics
 */
export function diagnoseDateHandling(testData?: any): {
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  results: DateDiagnosticResult[];
  overallHealth: 'GOOD' | 'WARNING' | 'CRITICAL';
} {
  const testCases: Array<{ name: string; value: any }> = testData || [
    { name: 'Valid ISO String', value: '2026-01-10T16:03:29.667Z' },
    { name: 'Valid Date Object', value: new Date('2026-01-10') },
    { name: 'Valid Timestamp', value: 1736527409667 },
    { name: 'Null Value', value: null },
    { name: 'Undefined Value', value: undefined },
    { name: 'Invalid String', value: 'invalid-date' },
    { name: 'Empty Object (Bug)', value: {} },
    { name: 'Empty String', value: '' },
    { name: 'Zero', value: 0 },
    { name: 'NaN', value: NaN },
  ];

  const results = testCases.map((tc) => diagnoseSingleDate(tc.name, tc.value));

  const summary = {
    totalTests: results.length,
    passed: results.filter((r) => r.isValid || r.input === null || r.input === undefined).length,
    failed: results.filter((r) => !r.isValid && r.input !== null && r.input !== undefined).length,
    warnings: results.filter((r) => r.issues.length > 0).length,
  };

  const overallHealth: 'GOOD' | 'WARNING' | 'CRITICAL' =
    summary.failed === 0 ? 'GOOD' : summary.failed <= 2 ? 'WARNING' : 'CRITICAL';

  return {
    summary,
    results,
    overallHealth,
  };
}

/**
 * Console-friendly diagnostic output
 */
export function printDateDiagnostics(testData?: any): void {
  const diagnosis = diagnoseDateHandling(testData);

  console.group('📅 Date Handling Diagnostics');

  console.log('\n📊 Summary:');
  console.log(`   Total Tests: ${diagnosis.summary.totalTests}`);
  console.log(`   ✅ Passed: ${diagnosis.summary.passed}`);
  console.log(`   ❌ Failed: ${diagnosis.summary.failed}`);
  console.log(`   ⚠️  Warnings: ${diagnosis.summary.warnings}`);
  console.log(`   Overall Health: ${diagnosis.overallHealth}`);

  console.log('\n📋 Detailed Results:');
  diagnosis.results.forEach((result) => {
    const icon = result.isValid ? '✅' : result.issues.length > 0 ? '❌' : '⚠️';
    console.group(`${icon} ${result.testCase}`);
    console.log('Input:', result.input);
    console.log('Valid:', result.isValid);
    console.log('Formatted:', result.formatted);
    console.log('With Time:', result.formattedWithTime);

    if (result.issues.length > 0) {
      console.log('⚠️ Issues:');
      result.issues.forEach((issue) => console.log(`   - ${issue}`));
    }

    if (result.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      result.recommendations.forEach((rec) => console.log(`   - ${rec}`));
    }

    console.groupEnd();
  });

  console.groupEnd();

  // Return health status
  if (diagnosis.overallHealth === 'CRITICAL') {
    console.error('🚨 CRITICAL: Multiple date handling failures detected!');
  } else if (diagnosis.overallHealth === 'WARNING') {
    console.warn('⚠️  WARNING: Some date issues detected');
  } else {
    console.log('✅ All date handling tests passed!');
  }
}

/**
 * Validate API response date fields
 */
export function validateAPIDateFields(
  apiResponse: any,
  requiredDateFields: string[] = ['createdAt', 'updatedAt']
): {
  valid: boolean;
  issues: Array<{ field: string; issue: string }>;
} {
  const issues: Array<{ field: string; issue: string }> = [];

  requiredDateFields.forEach((field) => {
    const value = apiResponse[field];

    if (value === undefined) {
      issues.push({ field, issue: 'Field is missing from response' });
      return;
    }

    if (value === null) {
      issues.push({ field, issue: 'Field is null (may be intentional)' });
      return;
    }

    // Check if it's a valid ISO string
    if (typeof value === 'string') {
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (!isoRegex.test(value)) {
        issues.push({
          field,
          issue: `Not in ISO 8601 format. Got: "${value}"`,
        });
      }
    } else if (typeof value === 'object') {
      if (Object.keys(value).length === 0) {
        issues.push({
          field,
          issue: 'Empty object {} - backend serialization issue',
        });
      } else {
        issues.push({
          field,
          issue: `Unexpected object type. Expected ISO string, got: ${JSON.stringify(value)}`,
        });
      }
    } else {
      issues.push({
        field,
        issue: `Unexpected type: ${typeof value}`,
      });
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Browser console helper - type this in DevTools
 */
if (typeof window !== 'undefined') {
  (window as any).diagnoseDates = printDateDiagnostics;
  (window as any).validateDates = validateAPIDateFields;
  console.log('💡 Date diagnostic tools loaded:');
  console.log('   - Type `diagnoseDates()` to run full diagnostics');
  console.log('   - Type `validateDates(apiResponse)` to validate API response');
}
