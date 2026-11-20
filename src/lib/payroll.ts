export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateSalaryTotal(basic: number, allowance: number, deduction: number) {
  return roundMoney(roundMoney(basic) + roundMoney(allowance) - roundMoney(deduction));
}

export function salaryPeriodKey(employeeId: string, periodStart: string, periodEnd: string) {
  return `${employeeId}:${periodStart}:${periodEnd}`;
}
