/**
 * Contact form handler for powerofcenter.com
 *
 * Validates submissions with:
 * - Cloudflare Turnstile (invisible CAPTCHA)
 * - Honeypot field (hidden field bots fill out)
 * - Timing check (reject instant submissions)
 *
 * Sends email via Resend API
 */

export interface Env {
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
  TO_EMAIL: string;
  FROM_EMAIL: string;
  FROM_NAME: string;
}

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
}

interface FormData {
  name: string;
  email: string;
  message: string;
  'cf-turnstile-response': string;
  _gotcha?: string;  // Honeypot field
  _timestamp?: string;  // Form load timestamp
}

// Allow both production and local dev origins
const ALLOWED_ORIGINS = [
  'https://powerofcenter.com',
  'http://localhost:1313',
  'http://127.0.0.1:1313',
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(request);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    try {
      const formData = await request.formData();
      const data = Object.fromEntries(formData) as unknown as FormData;

      // === VALIDATION ===

      // 1. Honeypot check - if filled, it's a bot
      if (data._gotcha && data._gotcha.length > 0) {
        console.log('Honeypot triggered');
        // Return success to not tip off bots
        return jsonResponse({ success: true }, 200, corsHeaders);
      }

      // 2. Timing check - reject if submitted too fast (< 3 seconds)
      if (data._timestamp) {
        const loadTime = parseInt(data._timestamp, 10);
        const submitTime = Date.now();
        const elapsed = submitTime - loadTime;

        if (elapsed < 3000) {
          console.log(`Timing check failed: ${elapsed}ms`);
          return jsonResponse({ success: true }, 200, corsHeaders);  // Fake success
        }
      }

      // 3. Turnstile validation
      const turnstileToken = data['cf-turnstile-response'];
      if (!turnstileToken) {
        return jsonResponse({ error: 'Missing captcha token' }, 400, corsHeaders);
      }

      const turnstileValid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, request);
      if (!turnstileValid) {
        return jsonResponse({ error: 'Captcha verification failed' }, 400, corsHeaders);
      }

      // 4. Required fields
      if (!data.name || !data.email || !data.message) {
        return jsonResponse({ error: 'Missing required fields' }, 400, corsHeaders);
      }

      // 5. Basic email format check
      if (!data.email.includes('@') || !data.email.includes('.')) {
        return jsonResponse({ error: 'Invalid email format' }, 400, corsHeaders);
      }

      // === SEND EMAIL ===
      const emailSent = await sendEmail(env, data);

      if (!emailSent) {
        return jsonResponse({ error: 'Failed to send email' }, 500, corsHeaders);
      }

      return jsonResponse({ success: true }, 200, corsHeaders);

    } catch (error) {
      console.error('Form processing error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500, corsHeaders);
    }
  },
};

async function verifyTurnstile(token: string, secret: string, request: Request): Promise<boolean> {
  const ip = request.headers.get('CF-Connecting-IP') || '';

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: ip,
    }),
  });

  const result = await response.json() as TurnstileResponse;

  if (!result.success) {
    console.log('Turnstile failed:', result['error-codes']);
  }

  return result.success;
}

async function sendEmail(env: Env, data: FormData): Promise<boolean> {
  // Resend API - https://resend.com
  // Requires RESEND_API_KEY secret and verified domain

  const emailContent = `
New contact form submission from powerofcenter.com

Name: ${data.name}
Email: ${data.email}

Message:
${data.message}

---
Sent via Cloudflare Worker
  `.trim();

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to: [env.TO_EMAIL],
      reply_to: data.email,
      subject: `Contact form: ${data.name}`,
      text: emailContent,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Resend error:', response.status, text);
    return false;
  }

  return true;
}

function jsonResponse(data: object, status = 200, corsHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
