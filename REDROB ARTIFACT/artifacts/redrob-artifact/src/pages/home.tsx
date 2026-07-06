import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldAlert, ShieldCheck, Shield, Activity, GitBranch, Github, Code2, AlertTriangle, ChevronRight, FileText, Database } from "lucide-react";
import { useVerifyDeveloper } from "@workspace/api-client-react";
import type { VerificationResult, SkillVerdict, VerificationError } from "@workspace/api-client-react";

// Remove empty data objects passed to the hook if not necessary
const schema = z.object({
  githubUrl: z.string().min(1, "GitHub reference required"),
  resumeText: z.string().min(10, "Target data payload too small. Provide complete schema.")
});

type FormData = z.infer<typeof schema>;

const LOADING_PHASES = [
  "[SYS] Initializing REDROB ARTIFACT kernel...",
  "[NET] Establishing secure uplink to GitHub API...",
  "[DAT] Scraping developer telemetry...",
  "[EXT] Parsing payload semantics...",
  "[ML]  Cross-referencing stated claims with empirical commits...",
  "[AI]  Running neural anomaly detection...",
  "[CAL] Aggregating credibility matrix...",
  "[SYS] Finalizing diagnostic report..."
];

export default function Home() {
  const [appState, setAppState] = useState<"intake" | "running" | "result">("intake");
  const [resultData, setResultData] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMessage] = useState<string | null>(null);
  const [loadingPhaseIndex, setLoadingPhaseIndex] = useState(0);

  const verifyMutation = useVerifyDeveloper();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      githubUrl: "",
      resumeText: ""
    }
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (appState === "running") {
      setLoadingPhaseIndex(0);
      interval = setInterval(() => {
        setLoadingPhaseIndex((prev) => {
          if (prev < LOADING_PHASES.length - 1) return prev + 1;
          return prev;
        });
      }, 1200); // 1.2s per phase
    }
    return () => clearInterval(interval);
  }, [appState]);

  const onSubmit = (data: FormData) => {
    setAppState("running");
    setErrorMessage(null);
    setResultData(null);

    verifyMutation.mutate({ data }, {
      onSuccess: (res) => {
        // Wait a bit to let the loading animation finish its cycle conceptually
        setTimeout(() => {
          setResultData(res);
          setAppState("result");
        }, 1500);
      },
      onError: (err: any) => {
        setTimeout(() => {
          const msg = err?.data?.error || err?.message || "Unknown anomaly detected during verification.";
          setErrorMessage(msg);
          setAppState("intake");
        }, 1000);
      }
    });
  };

  const reset = () => {
    setAppState("intake");
    setResultData(null);
    setErrorMessage(null);
    form.reset();
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-8 min-h-[100dvh] flex flex-col relative z-10">
      
      {/* Header */}
      <header className="flex items-center justify-between border-b border-primary/30 pb-4 mb-8">
        <div className="flex items-center gap-3">
          <Activity className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-widest uppercase">REDROB_ARTIFACT</h1>
            <p className="text-primary/70 text-xs font-mono uppercase tracking-wider">Identity Verification Protocol v2.4.1</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs border border-primary/30 px-3 py-1 bg-primary/5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          STATUS: ONLINE
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* INTAKE STATE */}
          {appState === "intake" && (
            <motion.div
              key="intake"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full"
            >
              <div className="mb-8 border-l-2 border-primary pl-4">
                <h2 className="text-lg font-bold mb-2 uppercase">Target Parameters Required</h2>
                <p className="text-sm text-primary/70">
                  Input target's self-reported capabilities and corresponding GitHub identifier. 
                  The system will cross-reference claims against historical commits and codebase linguistics.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 border border-destructive bg-destructive/10 text-destructive flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm font-mono whitespace-pre-wrap">{errorMsg}</div>
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub Identifier
                  </label>
                  <input
                    {...form.register("githubUrl")}
                    className="w-full bg-black/50 border border-primary/30 focus:border-primary px-4 py-3 text-primary font-mono outline-none transition-colors"
                    placeholder="e.g. https://github.com/username or username"
                    data-testid="input-github"
                  />
                  {form.formState.errors.githubUrl && (
                    <p className="text-destructive text-xs">{form.formState.errors.githubUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Self-Reported Payload (Resume/Skills)
                  </label>
                  <textarea
                    {...form.register("resumeText")}
                    className="w-full h-64 bg-black/50 border border-primary/30 focus:border-primary px-4 py-3 text-primary font-mono outline-none transition-colors resize-none"
                    placeholder="Paste resume text, skills list, or self-reported capabilities here..."
                    data-testid="input-resume"
                  />
                  {form.formState.errors.resumeText && (
                    <p className="text-destructive text-xs">{form.formState.errors.resumeText.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={verifyMutation.isPending}
                  className="w-full group relative bg-primary/10 border-2 border-primary hover:bg-primary hover:text-black text-primary font-bold py-4 uppercase tracking-widest transition-all duration-300 overflow-hidden flex justify-center items-center gap-3"
                  data-testid="button-verify"
                >
                  <Terminal className="w-5 h-5" />
                  <span>Execute Verification Artifact</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* RUNNING STATE */}
          {appState === "running" && (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center font-mono"
            >
              <div className="w-full max-w-xl border border-primary/30 bg-black/60 p-6 md:p-10 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary -translate-x-0.5 -translate-y-0.5"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary translate-x-0.5 -translate-y-0.5"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary -translate-x-0.5 translate-y-0.5"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary translate-x-0.5 translate-y-0.5"></div>

                <Activity className="w-12 h-12 text-primary animate-pulse mx-auto mb-8" />
                
                <div className="space-y-3 text-sm">
                  {LOADING_PHASES.map((phase, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-3 transition-opacity duration-300 ${
                        idx <= loadingPhaseIndex ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                      <span className={`${idx === loadingPhaseIndex ? "text-primary font-bold animate-pulse" : "text-primary/50"}`}>
                        {phase}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 h-1 w-full bg-primary/20 overflow-hidden relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(((loadingPhaseIndex + 1) / LOADING_PHASES.length) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULT STATE */}
          {appState === "result" && resultData && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex-1 w-full space-y-6"
            >
              {/* Top Banner - Score */}
              <div className="border-2 border-primary bg-primary/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute left-0 bottom-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                
                <div className="z-10 flex flex-col">
                  <h2 className="text-sm uppercase tracking-widest text-primary/70 mb-1">Diagnostic Output</h2>
                  <div className="text-2xl font-bold tracking-wider">CREDIBILITY SCAN COMPLETE</div>
                </div>
                
                <div className="z-10 flex items-center gap-4 bg-black/50 px-6 py-4 border border-accent/40">
                  <div className="text-sm uppercase tracking-widest text-accent/80 text-right">
                    <div>Confidence</div>
                    <div>Quotient</div>
                  </div>
                  <ScoreDisplay score={resultData.score} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col - GitHub Data & Summary */}
                <div className="space-y-6 lg:col-span-1">
                  
                  {/* GitHub Block */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="border border-primary/30 bg-black/40 p-5"
                  >
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-primary/20">
                      <Database className="w-4 h-4 text-primary" />
                      <h3 className="uppercase tracking-widest text-sm font-bold">Telemetry Source</h3>
                    </div>
                    
                    <div className="space-y-4 text-sm">
                      <div>
                        <div className="text-primary/50 text-xs mb-1 uppercase">Target Entity</div>
                        <a href={resultData.github_summary.profile_url} target="_blank" rel="noreferrer" className="text-lg font-bold hover:underline flex items-center gap-2">
                          @{resultData.github_summary.username}
                        </a>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-primary/50 text-xs mb-1 uppercase">Repositories</div>
                          <div className="font-mono text-xl">{resultData.github_summary.total_repos}</div>
                        </div>
                        <div>
                          <div className="text-primary/50 text-xs mb-1 uppercase">Active Node</div>
                          <div className="font-mono truncate" title={resultData.github_summary.most_active_repo || "N/A"}>
                            {resultData.github_summary.most_active_repo || "NONE"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-primary/50 text-xs mb-1 uppercase">Primary Vectors (Languages)</div>
                        <div className="flex flex-wrap gap-2">
                          {resultData.github_summary.top_languages.length > 0 ? (
                            resultData.github_summary.top_languages.map(lang => (
                              <span key={lang} className="px-2 py-0.5 border border-primary/40 bg-primary/10 text-xs">
                                {lang}
                              </span>
                            ))
                          ) : (
                            <span className="text-primary/50 text-xs">NO VECTORS DETECTED</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Evidence Paragraph */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="border border-primary/30 bg-primary/5 p-5 relative"
                  >
                    <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>
                    <div className="flex items-center gap-2 mb-3">
                      <Code2 className="w-4 h-4" />
                      <h3 className="uppercase tracking-widest text-sm font-bold">Synthesis</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-primary/90">
                      {resultData.evidence}
                    </p>
                  </motion.div>
                </div>

                {/* Right Col - Verdicts */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="lg:col-span-2 border border-primary/30 bg-black/40 p-5"
                >
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-primary/20">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-primary" />
                      <h3 className="uppercase tracking-widest text-sm font-bold">Capability Matrix Analysis</h3>
                    </div>
                    <div className="text-xs text-primary/50 uppercase">{Object.keys(resultData.verdicts).length} Vectors Scanned</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(resultData.verdicts).map(([skill, verdict], idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + (idx * 0.05) }}
                        key={skill}
                        className="flex items-center justify-between p-3 border border-primary/20 bg-black/50"
                      >
                        <span className="font-mono text-sm truncate pr-2" title={skill}>{skill}</span>
                        <VerdictBadge verdict={verdict} />
                      </motion.div>
                    ))}
                    {Object.keys(resultData.verdicts).length === 0 && (
                      <div className="col-span-full py-8 text-center text-primary/50 text-sm italic">
                        NO DISCRETE CAPABILITIES EXTRACTED FROM PAYLOAD
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="pt-8 flex justify-center"
              >
                <button
                  onClick={reset}
                  className="px-8 py-3 border border-primary/50 hover:bg-primary/20 text-sm uppercase tracking-widest transition-colors flex items-center gap-2"
                  data-testid="button-reset"
                >
                  <Terminal className="w-4 h-4" />
                  Initiate New Scan
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <footer className="mt-12 py-4 border-t border-primary/20 text-center text-xs text-primary/40 flex justify-between uppercase">
        <span>REDROB_ARTIFACT // AUTHORIZED PERSONNEL ONLY</span>
        <span>SECURE TERMINAL SESSION</span>
      </footer>
    </div>
  );
}

function ScoreDisplay({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const increment = Math.ceil(score / 40); // 40 steps max
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(current);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="text-5xl md:text-6xl font-black font-mono tracking-tighter w-24 text-right">
      {displayScore}
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  if (verdict === "verified") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/20 border border-accent text-accent text-xs uppercase tracking-wider font-bold">
        <ShieldCheck className="w-3 h-3" />
        Verified
      </div>
    );
  }
  if (verdict === "partial") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/20 border border-yellow-500 text-yellow-500 text-xs uppercase tracking-wider font-bold">
        <Shield className="w-3 h-3" />
        Partial
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 border border-red-500 text-red-500 text-xs uppercase tracking-wider font-bold">
      <ShieldAlert className="w-3 h-3" />
      Unverified
    </div>
  );
}
