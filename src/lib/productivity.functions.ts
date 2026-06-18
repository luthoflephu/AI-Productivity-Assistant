import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getGatewayModel } from "./ai-gateway.server";

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        purpose: z.string().min(1).max(2000),
        recipient: z.string().max(200).optional().default(""),
        context: z.string().max(4000).optional().default(""),
        tone: z.enum(["Formal", "Friendly", "Professional", "Concise", "Persuasive"]),
        length: z.enum(["Short", "Medium", "Long"]),
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
          alternatives: z.array(z.object({ subject: z.string(), body: z.string() })).max(2),
          tips: z.array(z.string()).max(5),
        }),
      }),
      system: `You write polished workplace emails. Be clear, respectful, and action-oriented. Use professional formatting with appropriate greeting and signoff placeholder ([Your Name]).`,
      prompt: `Purpose: ${data.purpose}\nRecipient: ${data.recipient || "n/a"}\nContext: ${data.context || "n/a"}\nTone: ${data.tone}\nLength: ${data.length}\n\nWrite a primary email plus up to 2 alternative versions and brief writing tips.`,
    });
    return output;
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ transcript: z.string().min(20).max(20000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { output } = await generateText({
      model: getGatewayModel(),
      output: Output.object({
        schema: z.object({
          title: z.string(),
          summary: z.string(),
          keyDecisions: z.array(z.string()),
          actionItems: z.array(
            z.object({
              task: z.string(),
              owner: z.string(),
              dueDate: z.string(),
            }),
          ),
          openQuestions: z.array(z.string()),
          followUps: z.array(z.string()),
        }),
      }),
      system: `You summarize meeting notes for busy professionals. Extract concrete decisions, action items with owners, and follow-ups. If owner/due date are unclear, use "Unassigned" / "TBD".`,
      prompt: `Meeting transcript / notes:\n"""${data.transcript}"""`,
    });
    return output;
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        goal: z.string().min(1).max(2000),
        deadline: z.string().max(100).optional().default(""),
        constraints: z.string().max(2000).optional().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { output } = await generateText({
      model: getGatewayModel(),
      output: Output.object({
        schema: z.object({
          objective: z.string(),
          milestones: z.array(
            z.object({
              name: z.string(),
              target: z.string(),
              tasks: z.array(
                z.object({
                  title: z.string(),
                  priority: z.enum(["Low", "Medium", "High"]),
                  estimate: z.string(),
                  notes: z.string(),
                }),
              ),
            }),
          ),
          risks: z.array(z.string()),
          quickWins: z.array(z.string()),
        }),
      }),
      system: `You are a productivity planner. Break goals into milestones with realistic, prioritized tasks. Use SMART principles. Keep estimates realistic (e.g. "2h", "1 day").`,
      prompt: `Goal: ${data.goal}\nDeadline: ${data.deadline || "n/a"}\nConstraints: ${data.constraints || "n/a"}`,
    });
    return output;
  });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        topic: z.string().min(1).max(500),
        depth: z.enum(["Brief", "Standard", "Deep"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { output } = await generateText({
      model: getGatewayModel(),
      output: Output.object({
        schema: z.object({
          summary: z.string(),
          keyPoints: z.array(z.string()),
          sections: z.array(z.object({ heading: z.string(), content: z.string() })),
          pros: z.array(z.string()),
          cons: z.array(z.string()),
          relatedTopics: z.array(z.string()),
          suggestedQuestions: z.array(z.string()),
        }),
      }),
      system: `You are a workplace research assistant. Provide structured, balanced, factual overviews suitable for professional use. Note when information may be outdated and recommend verification.`,
      prompt: `Research topic: ${data.topic}\nDesired depth: ${data.depth}`,
    });
    return output;
  });
