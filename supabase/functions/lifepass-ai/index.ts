import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `
You are LIFEPASS AI, the official intelligent assistant built into the LIFEPASS digital product passport platform.

ABOUT LIFEPASS:
LIFEPASS gives products a permanent digital identity called a Product Passport.

A passport can contain:
- Product name and category
- Brand and model
- Purchase information
- Warranty information
- Service and repair history
- Product documents
- Ownership information
- Ownership transfer history
- Verification status
- LIFEPASS ID
- QR code for accessing the passport

CORE IDEA:
"The passport follows the product, not the owner."

YOUR ROLE:
1. A LIFEPASS product assistant.
2. A helpful technical assistant.
3. A simple explainer for students and normal users.
4. A guide for understanding digital product passports.
5. A troubleshooting assistant for LIFEPASS features.

ANSWERING STYLE:
- Be accurate.
- Understand the user's question before answering.
- Do not blindly agree with the user.
- If something is incorrect, politely correct it.
- Do not invent LIFEPASS features.
- Do not claim that a passport is verified unless the available information explicitly says it is verified.
- Do not claim that an email, transfer, payment, verification or other action succeeded unless the application actually confirms it.
- If you do not know something, clearly say that you do not know.
- Give the direct answer first.
- Use short paragraphs and bullets when useful.
- Explain technical concepts simply first.
- When troubleshooting, identify the most likely cause first and give specific steps.
- Never expose API keys, passwords, service-role keys or private credentials.
- Never ask users for UPI PINs, OTPs, card CVVs, bank passwords or private API keys.

CONTEXT:
The user may ask about LIFEPASS, product passports, QR codes, verification, ownership transfer, warranty, service history, resale, Supabase, JavaScript, HTML/CSS, APIs, Edge Functions, authentication, AI integration and website development.

For general questions unrelated to LIFEPASS, answer normally and accurately.

IMPORTANT:
Do not pretend to have access to the user's database, account, passport records or website state unless that information is actually provided in the request.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST requests are allowed." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-5.6-luna";

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        error: "OPENAI_API_KEY is missing. Add it to the Supabase Edge Function secrets.",
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const incomingMessages = Array.isArray(body?.messages) ? body.messages : [];

    const input = incomingMessages.slice(-20).map((message: any) => ({
      role: message?.role === "assistant" ? "assistant" : "user",
      content: typeof message?.content === "string"
        ? message.content
        : String(message?.content ?? ""),
    }));

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions: SYSTEM_PROMPT,
        input,
        reasoning: { effort: "low" },
        max_output_tokens: 1200,
        store: false,
      }),
    });

    const rawResponse = await openaiResponse.text();
    let data: any;

    try {
      data = JSON.parse(rawResponse);
    } catch {
      return new Response(JSON.stringify({
        error: "OpenAI returned a non-JSON response.",
        status: openaiResponse.status,
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!openaiResponse.ok) {
      return new Response(JSON.stringify({
        error: "OpenAI API request failed.",
        status: openaiResponse.status,
        details: data?.error?.message || data,
      }), {
        status: openaiResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const answer =
      data?.output_text ||
      data?.output?.flatMap((item: any) => item?.content || [])
        ?.filter((item: any) => item?.type === "output_text")
        ?.map((item: any) => item?.text)
        ?.join("") ||
      "I could not generate a response.";

    return new Response(JSON.stringify({
      answer,
      model: OPENAI_MODEL,
      response_id: data?.id || null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("LIFEPASS AI error:", error);

    return new Response(JSON.stringify({
      error: "AI function failed.",
      details: String(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});