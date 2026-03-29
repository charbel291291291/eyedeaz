import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';
import { sendApiError, sendApiSuccess } from '../lib/responses';
import { aiBriefSchema } from '../validation/ai';

const suspiciousPatterns = [/ignore\s+previous/i, /system\s+prompt/i, /<script/i, /https?:\/\//i];

export const aiRouter = Router();

function getGeminiClient() {
  if (!env.GEMINI_API_KEY) {
    return null;
  }

  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

aiRouter.post('/brief', async (req, res) => {
  const parsed = aiBriefSchema.safeParse(req.body);

  if (!parsed.success) {
    sendApiError(res, 400, 'invalid_prompt', 'Please write a slightly more detailed prompt.');
    return;
  }

  const { prompt } = parsed.data;

  if (suspiciousPatterns.some((pattern) => pattern.test(prompt))) {
    sendApiError(res, 400, 'unsafe_prompt', 'That request cannot be processed.');
    return;
  }

  const ai = getGeminiClient();

  if (!ai) {
    sendApiError(res, 503, 'ai_unavailable', 'AI demo is unavailable right now.');
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL_TEXT,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: [
                'You are the eyedeaz Idea Spark.',
                'Reply in under 120 words.',
                'Give exactly 3 short bullets:',
                '1. concept direction',
                '2. recommended website/PWA experience',
                '3. strongest lead magnet or CTA',
                `Prompt: ${prompt}`,
              ].join('\n'),
            },
          ],
        },
      ],
    });

    sendApiSuccess(res, {
      text: response.text?.trim() || 'We could not generate a response this time.',
    });
  } catch (error) {
    console.error('AI demo failed:', error);
    sendApiError(res, 502, 'ai_failed', 'AI demo is temporarily unavailable.');
  }
});
