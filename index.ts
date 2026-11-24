// Supabase Edge Function: ask-ai. Set OPENAI_API_KEY as a Supabase secret.
// Deploy with: supabase functions deploy ask-ai
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const { question } = await req.json();
  if (typeof question !== "string" || question.length > 500) return Response.json({ error: "Invalid question" }, { status: 400 });
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return Response.json({ answer: "The AI assistant is being configured. You can contact Tanish at tanishhdumbbo@gmail.com." });
  const system = `You are TanishAI, the helpful assistant on TanishGG's portfolio. Answer only using these facts. Tanish is a Discord server developer, website designer, UI/UX creative and Roblox game developer. Contact: email tanishhdumbbo@gmail.com; Discord https://discord.com/users/1465283869195501670; Instagram https://www.instagram.com/tanishhhg?evlk=MTQxaGNlMDlwNGRnYg==. Team: Tanish is Founder & Lead Developer; Weirdmine is Developer; Sky is Helper and Team Staff only (not a partner or developer). If asked for exact pricing, say prices depend on scope and direct them to the Budget page. Do not invent prices, project facts or availability.`;
  const response = await fetch("https://api.openai.com/v1/responses", { method:"POST", headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"}, body:JSON.stringify({model:"gpt-4.1-mini",input:[{role:"system",content:system},{role:"user",content:question}]})});
  if (!response.ok) return Response.json({ answer:"I couldn't reach the AI service right now. Please contact Tanish directly." });
  const data = await response.json();
  const answer = data.output?.flatMap((o:any)=>o.content||[]).filter((c:any)=>c.type==="output_text").map((c:any)=>c.text).join("\n") || "Please contact Tanish directly.";
  return Response.json({ answer });
});
