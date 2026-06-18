import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getGatewayModel } from "./ai-gateway.server";

const DISCLAIMER =
  "Always include a brief note that AI assessments are advisory and the user should verify with official sources.";

export const analyzeScam = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ message: z.string().min(1).max(8000) }).parse(d))
  .handler(async ({ data }) => {
    const { output } = await generateText({
      model: getGatewayModel(),
      output: Output.object({
        schema: z.object({
          riskScore: z.number().min(0).max(100),
          riskLevel: z.enum(["Low", "Medium", "High"]),
          scamType: z.string(),
          confidence: z.number().min(0).max(100),
          redFlags: z.array(z.string()),
          explanation: z.string(),
          recommendedActions: z.array(z.string()),
        }),
      }),
      system: `You are ScamGuard AI, a fraud detection assistant. Analyze the message for scam indicators: urgency tactics, suspicious links, money/password requests, impersonation, fake job offers, investment scams, romance scams, phishing. Be specific and educational.`,
      prompt: `Analyze this message:\n\n"""${data.message}"""`,
    });
    return output;
  });

export const generateSafeEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        originalMessage: z.string().min(1).max(8000),
        goal: z.string().min(1).max(500),
        tone: z.enum(["Formal", "Friendly", "Professional", "Assertive"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { output } = await generateText({
      model: getGatewayModel(),
      output: Output.object({
        schema: z.object({
          subject: z.string(),
          body: z.string(),
          alternatives: z.array(z.object({ subject: z.string(), body: z.string() })),
          safetyNotes: z.array(z.string()),
        }),
      }),
      system: `You generate safe email responses to suspicious messages. Never share personal info, passwords, or money. Do not click links. ${DISCLAIMER}`,
      prompt: `Original suspicious message:\n"""${data.originalMessage}"""\n\nResponse goal: ${data.goal}\nTone: ${data.tone}\n\nGenerate a primary response and 2 alternatives.`,
    });
    return output;
  });

export const researchScam = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ topic: z.string().min(1).max(300) }).parse(d))
  .handler(async ({ data }) => {
    const { output } = await generateText({
      model: getGatewayModel(),
      output: Output.object({
        schema: z.object({
          summary: z.string(),
          warningSigns: z.array(z.string()),
          howScammersOperate: z.array(z.string()),
          preventionTips: z.array(z.string()),
          recommendedActions: z.array(z.string()),
          keyInsights: z.array(z.string()),
        }),
      }),
      system: `You are a scam education researcher. Provide accurate, educational content about scam types.`,
      prompt: `Research this scam topic: ${data.topic}`,
    });
    return output;
  });

export const planRecovery = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ incident: z.string().min(1).max(8000) }).parse(d))
  .handler(async ({ data }) => {
    const { output } = await generateText({
      model: getGatewayModel(),
      output: Output.object({
        schema: z.object({
          priority: z.enum(["Low", "Medium", "High", "Critical"]),
          immediateActions: z.array(z.string()),
          securityRecommendations: z.array(z.string()),
          bankingActions: z.array(z.string()),
          accountProtection: z.array(z.string()),
          followUpChecklist: z.array(z.string()),
        }),
      }),
      system: `You help scam victims recover. Be empathetic, clear, and prioritized. ${DISCLAIMER}`,
      prompt: `Incident description:\n"""${data.incident}"""\n\nCreate a recovery plan.`,
    });
    return output;
  });
