export type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  company?: string;
  page?: string;
};

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

async function postJson<TResponse>(path: string, payload: unknown): Promise<TResponse> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiErrorResponse;
    throw new Error(error.error?.message || 'Request failed.');
  }

  return (await response.json()) as TResponse;
}

export async function submitLead(payload: LeadPayload) {
  return postJson<{ ok: boolean; message: string }>('/api/leads', payload);
}

export async function requestIdeaBrief(prompt: string) {
  return postJson<{ text: string }>('/api/ai/brief', { prompt });
}
