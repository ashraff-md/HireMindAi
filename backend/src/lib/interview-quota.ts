/** Free tier: max completed interview preparations per calendar month (UTC). */
export const FREE_INTERVIEWS_PER_UTC_MONTH = 2;

export class InterviewMonthlyLimitError extends Error {
  readonly code = "interview_monthly_limit" as const;

  constructor(
    readonly usedThisMonth: number,
    readonly limit: number,
  ) {
    super(
      `You have used all ${limit} free interview preparations for this month (${usedThisMonth} started). Upgrade for unlimited sessions.`,
    );
    this.name = "InterviewMonthlyLimitError";
  }
}
