// Optional server route for a real AI writing assistant. Not wired up under the
// current Cloudflare Workers static-asset deployment (see README) — the app
// works fully without it via the offline rewrite in src/lib/generateJournalEntry.ts.

interface Env {
  ANTHROPIC_API_KEY?: string;
}

interface RequestBody {
  roughNote?: string;
  context?: {
    mode?: string;
    journalType?: string;
    customTypeDescription?: string;
    subject?: string;
  };
  variantIndex?: number;
  warm?: boolean;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "AI not configured" }, 501);
  }

  let body: RequestBody;
  try {
    body = (await context.request.json()) as RequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const roughNote = body.roughNote?.trim();
  if (!roughNote) {
    return jsonResponse({ error: "Missing roughNote" }, 400);
  }

  const ctx = body.context ?? {};
  const typeDescription = ctx.journalType === "other" ? ctx.customTypeDescription : ctx.journalType;

  const prompt = `You are a warm, human writing assistant helping someone turn a rough note into a journal page.

Journal type: ${typeDescription ?? "personal"}
Who it's about: ${ctx.subject ?? "unspecified"}
${body.warm ? "Make the tone a little warmer than usual." : ""}

Rules, follow exactly:
- Preserve the pronouns and perspective exactly as the person wrote them (I, we, she, he, they, names). Do not convert between first person, "we", and third person, and do not change who performed each action.
- Never invent facts, names, places, people, food, weather, or events not in the note.
- 120 to 220 words, shorter if the note is short. Never pad with invented details.
- Sound like a real person, not an AI: no em dashes or en dashes, use commas/periods/"and" instead.
- Simple everyday words, natural contractions, mix short and long sentences.
- No big life-lesson ending. No "cherish", "treasure", "tapestry", "testament", "whirlwind", "journey", "embark", "delve", "heartwarming", "little did I know", "in that moment", "etched in my memory", "forever grateful".
- No exclamation-heavy tone, no emojis, no hashtags.
- Write in the same language as the note.
- Also suggest a short title, 6 words or fewer.

Rough note: "${roughNote}"

Respond with only JSON: {"title": "...", "text": "..."}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    return jsonResponse({ error: "AI request failed" }, 502);
  }

  const data = (await response.json()) as { content?: { text?: string }[] };
  const raw = data.content?.[0]?.text?.trim() ?? "";

  let parsed: { title?: string; text?: string } = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { title: undefined, text: raw };
  }

  return jsonResponse({ title: parsed.title, text: parsed.text ?? "" });
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
