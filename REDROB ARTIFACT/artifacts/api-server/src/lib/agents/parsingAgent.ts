import { gemini, GEMINI_MODEL } from "../gemini";
import { logger } from "../logger";

export class ParsingAgentError extends Error {}

function extractJsonArray(text: string): unknown {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1] : text;
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) {
    throw new ParsingAgentError("Gemini did not return a JSON array");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export async function extractSkills(resumeText: string): Promise<string[]> {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Extract all technical skills, frameworks, and languages from this resume text. Return ONLY a JSON array of skill names, nothing else. Example: ["Java", "React", "Node.js"]\n\nResume text:\n${resumeText}`,
            },
          ],
        },
      ],
      config: { maxOutputTokens: 8192 },
    });

    const text = response.text ?? "";
    const parsed = extractJsonArray(text);

    if (!Array.isArray(parsed)) {
      throw new ParsingAgentError("Gemini response was not an array");
    }

    const skills = parsed
      .filter((item): item is string => typeof item === "string")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const deduped = Array.from(
      new Map(skills.map((skill) => [skill.toLowerCase(), skill])).values(),
    );

    if (deduped.length === 0) {
      throw new ParsingAgentError("No skills could be extracted from the resume text");
    }

    return deduped;
  } catch (err) {
    if (err instanceof ParsingAgentError) {
      throw err;
    }
    logger.error({ err }, "Parsing agent failed to reach Gemini");
    throw new ParsingAgentError("AI verification failed. Try again.");
  }
}
