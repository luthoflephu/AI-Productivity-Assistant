import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getGatewayModel } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        const result = streamText({
          model: getGatewayModel(),
          system: `You are WorkflowAI, a helpful workplace productivity assistant. You help professionals draft emails, summarize meetings, plan tasks and projects, research topics, and brainstorm ideas. Be concise, structured, and action-oriented. Use markdown formatting (headings, bold, lists, tables, code blocks) for clarity. Ask brief clarifying questions only when essential. Remind the user to review AI output before sending or acting on it when relevant.`,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
