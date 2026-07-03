import { Router, type IRouter } from "express";
import { VerifyDeveloperBody, VerifyDeveloperResponse } from "@workspace/api-zod";
import { extractSkills, ParsingAgentError } from "../lib/agents/parsingAgent";
import {
  fetchGithubProfile,
  summarizeGithubProfile,
  GithubAgentError,
} from "../lib/agents/githubAgent";
import { computeVerdicts, generateEvidenceSummary } from "../lib/agents/verificationAgent";
import { computeScore } from "../lib/agents/scoringAgent";

const router: IRouter = Router();

router.post("/verify", async (req, res): Promise<void> => {
  const parsed = VerifyDeveloperBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Please paste your resume or skills list." });
    return;
  }

  const { githubUrl, resumeText } = parsed.data;

  if (resumeText.trim().length === 0) {
    res.status(400).json({ error: "Please paste your resume or skills list." });
    return;
  }

  try {
    const profile = await fetchGithubProfile(githubUrl);

    const skills = await extractSkills(resumeText);

    const verdicts = computeVerdicts(skills, profile);
    const evidence = await generateEvidenceSummary(verdicts, profile);
    const score = computeScore(verdicts);
    const githubSummary = summarizeGithubProfile(profile);

    req.log.info({ username: githubSummary.username, score }, "Verification completed");

    res.json(
      VerifyDeveloperResponse.parse({
        score,
        verdicts,
        evidence,
        github_summary: githubSummary,
      }),
    );
  } catch (err) {
    if (err instanceof GithubAgentError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    if (err instanceof ParsingAgentError) {
      res.status(502).json({ error: err.message });
      return;
    }
    if (err instanceof Error && err.message === "AI verification failed. Try again.") {
      res.status(502).json({ error: err.message });
      return;
    }
    req.log.error({ err }, "Verification pipeline failed unexpectedly");
    res.status(502).json({ error: "AI verification failed. Try again." });
  }
});

export default router;
