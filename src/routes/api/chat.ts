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
          system: `You are ScamGuard AI, an expert fraud-prevention advisor. Help users identify scams, explain suspicious messages, suggest next steps, and educate on safety practices. Use markdown formatting (headings, bold, lists). Always remind users that your assessments are advisory and to verify with official sources for financial or security decisions.`,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
