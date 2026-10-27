// From the github api documentation
// https://docs.github.com/en/rest/metrics/statistics?apiVersion=2026-03-10#get-the-weekly-commit-activity

export type WeeklyCommitActivity = {
    days: number[]; // Commits per day, starting Sunday
    total: number; // Total commits during the week
    week: number; // Unix timestamp for the start of the week
};
