// Environment configuration
export const config = {
  github: {
    owner: import.meta.env.VITE_GITHUB_OWNER || 'your-github-username',
    repo: import.meta.env.VITE_GITHUB_REPO || 'prolearning-db',
    token: import.meta.env.VITE_GITHUB_TOKEN || 'your-github-token',
  },
  ai: {
    chutesToken: import.meta.env.VITE_CHUTES_API_TOKEN || '',
    geminiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY || '',
    cloudflareAccountId: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || '',
    cloudflareToken: import.meta.env.VITE_CLOUDFLARE_API_TOKEN || '',
    openai: import.meta.env.VITE_OPENAI_API_KEY || '',
    primaryProvider: import.meta.env.VITE_AI_PRIMARY_PROVIDER || 'chutes',
    chutesModel: import.meta.env.VITE_CHUTES_MODEL || 'deepseek-ai/DeepSeek-V3-0324',
    geminiModel: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp',
  },
  payment: {
    paystackPublicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    paystackSecretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY || '',
  },
  app: {
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api',
  },
};

export const CURRENCY_RATES: Record<string, number> = {
  'USD': 1.0,
  'NGN': 1600,
  'GBP': 0.79,
  'EUR': 0.92,
  'CAD': 1.36,
  'AUD': 1.52,
  'INR': 83,
  'ZAR': 18.5,
  'KES': 129,
  'GHS': 15.8,
};

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'Nigeria': 'NGN',
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Germany': 'EUR',
  'France': 'EUR',
  'India': 'INR',
  'South Africa': 'ZAR',
  'Kenya': 'KES',
  'Ghana': 'GHS',
};
