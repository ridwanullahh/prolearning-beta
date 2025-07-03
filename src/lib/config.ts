
export const config = {
  github: {
    owner: import.meta.env.VITE_GITHUB_OWNER,
    repo: import.meta.env.VITE_GITHUB_REPO,
    token: import.meta.env.VITE_GITHUB_TOKEN,
  },
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  },
  ai: {
    chutesToken: import.meta.env.VITE_CHUTES_TOKEN,
    geminiKey: import.meta.env.VITE_GEMINI_API_KEY,
    cloudflareAccountId: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID,
    cloudflareToken: import.meta.env.VITE_CLOUDFLARE_API_TOKEN,
  },
  payment: {
    paystackPublicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    paystackSecretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY,
  },
  app: {
    name: 'ProLearning',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    version: '1.0.0'
  }
};

export const CURRENCY_RATES: Record<string, number> = {
  'USD': 1,
  'NGN': 1650,
  'GBP': 0.79,
  'EUR': 0.85,
  'CAD': 1.25,
  'AUD': 1.35,
  'INR': 83,
  'ZAR': 18,
  'KES': 130,
  'GHS': 12
};
