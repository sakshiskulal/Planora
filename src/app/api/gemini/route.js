import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Server-side route using the official @google/genai client.
// Install: `npm install @google/genai` and set `GEMINI_API_KEY` or `GOOGLE_API_KEY` in env.

export function isValidIsoDate(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function normalizeTask(task, index) {
  const rawTitle = typeof task?.title === 'string' ? task.title.trim() : '';
  const title = rawTitle.length > 0 ? rawTitle : `Task ${index + 1}`;

  const parsedDuration = Number.parseInt(task?.durationMinutes, 10);
  const durationMinutes = Number.isFinite(parsedDuration) && parsedDuration > 0
    ? Math.max(5, parsedDuration)
    : 30;

  const parsedPriority = Number.parseInt(task?.priority, 10);
  const priority = Number.isFinite(parsedPriority)
    ? Math.min(5, Math.max(1, parsedPriority))
    : 3;

  const deadline = isValidIsoDate(task?.deadline) ? new Date(task.deadline).toISOString() : null;

  return {
    title,
    durationMinutes,
    priority,
    deadline,
  };
}

export async function POST(req) {
  try {
    const { text } = await req.json();
    const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview';

    if (!API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY or GOOGLE_API_KEY not configured' }, { status: 400 });
    }

    // Initialize client; constructor reads API key from environment by default but we pass it for clarity.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `Parse the following user text into tasks.\n\nUser text:\n${text}`;

    // Use the models.generateContent helper from the client.
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You extract tasks from user text and return only structured JSON. Fill missing values with defaults: durationMinutes=30, priority=3, deadline=null. Keep priority between 1 and 5. IMPORTANT: return the `deadline` field as an ISO 8601 timestamp (UTC) like 2026-04-22T10:00:00Z or null. Do not return relative dates (e.g., "tomorrow") or human-friendly phrases.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              durationMinutes: { type: 'integer' },
              priority: { type: 'integer' },
              deadline: { type: 'string', nullable: true },
            },
            required: ['title', 'durationMinutes', 'priority', 'deadline'],
            propertyOrdering: ['title', 'durationMinutes', 'priority', 'deadline'],
          },
        },
        maxOutputTokens: 512,
      },
    });

    // response.text is commonly available in quickstart examples; fallback to stringifying response.
    const generated = response?.text || response?.outputText || JSON.stringify(response);

    try {
      const parsed = JSON.parse(generated);
      if (!Array.isArray(parsed)) {
        return NextResponse.json({ error: 'LLM returned JSON but not an array', raw: parsed }, { status: 502 });
      }

      const tasks = parsed
        .map((task, index) => normalizeTask(task, index))
        .filter((task) => task.title.length > 0);

      if (tasks.length === 0) {
        return NextResponse.json({ error: 'No valid tasks extracted from model output', raw: parsed }, { status: 502 });
      }

      return NextResponse.json({ tasks });
    } catch (err) {
      return NextResponse.json({ error: 'Could not parse LLM output as JSON', raw: generated }, { status: 502 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
