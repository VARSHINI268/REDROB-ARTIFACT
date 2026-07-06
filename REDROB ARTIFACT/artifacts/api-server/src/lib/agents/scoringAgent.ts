import type { SkillVerdictValue } from "./verificationAgent";

export function computeScore(verdicts: Record<string, SkillVerdictValue>): number {
  const values = Object.values(verdicts);

  if (values.length === 0) {
    return 0;
  }

  const verifiedCount = values.filter((v) => v === "verified").length;
  const partialCount = values.filter((v) => v === "partial").length;

  const raw = ((verifiedCount * 100 + partialCount * 50) / (values.length * 100)) * 100;

  return Math.min(100, Math.round(raw));
}
