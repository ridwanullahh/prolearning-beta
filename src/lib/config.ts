// Environment configuration

// This check allows the config to work in both client (Vite) and server (Node.js) environments.
const isServer = typeof window === 'undefined';

const getEnv = (key: string) => {
  if (isServer) {
    return process.env[key];
  }
  return import.meta.env[key];
};

export const config = {
  github: {
    owner: getEnv('VITE_GITHUB_OWNER'),
    repo: getEnv('VITE_GITHUB_REPO'),
    token: getEnv('VITE_GITHUB_TOKEN'),
  },
  ai: {
    chutesToken: getEnv('VITE_CHUTES_API_TOKEN') || '',
    geminiKey: getEnv('VITE_GEMINI_AI_KEY') || 'AIzaSyBc0N-5GmNRED_voJJOm6hJsJIfL5XMPUM',
    // Support for multiple Gemini API keys for aggregation
    geminiKeys: (getEnv('VITE_GEMINI_AI_KEYS') || getEnv('VITE_GEMINI_AI_KEY') || 'AIzaSyBc0N-5GmNRED_voJJOm6hJsJIfL5XMPUM')
      .split(',')
      .map((key: string) => key.trim())
      .filter((key: string) => key.length > 0),
    cloudflareAccountId: getEnv('VITE_CLOUDFLARE_ACCOUNT_ID') || '',
    cloudflareToken: getEnv('VITE_CLOUDFLARE_API_TOKEN') || '',
    openai: getEnv('VITE_OPENAI_API_KEY') || '',
    primaryProvider: getEnv('VITE_AI_PRIMARY_PROVIDER') || 'chutes',
    chutesModel: getEnv('VITE_CHUTES_MODEL') || 'deepseek-ai/DeepSeek-V3-0324',
    geminiModel: getEnv('VITE_GEMINI_MODEL') || 'gemini-2.0-flash-exp',
  },
  payment: {
    paystackPublicKey: getEnv('VITE_PAYSTACK_PUBLIC_KEY') || '',
    paystackSecretKey: getEnv('VITE_PAYSTACK_SECRET_KEY') || '',
    platformCommission: parseFloat(getEnv('VITE_PLATFORM_COMMISSION') || '15'),
  },
  app: {
    url: getEnv('VITE_APP_URL') || 'http://localhost:5173',
    apiBaseUrl: getEnv('VITE_API_BASE_URL') || 'http://localhost:3001',
    adminUserId: getEnv('VITE_ADMIN_USER_ID') || '',
    admins: (getEnv('VITE_ADMIN_CREDENTIALS') || '')
      .split(',')
      .map((cred: string) => {
        const [email, password] = cred.split(':');
        return { email, password };
      }),
  },
  email: {
    user: getEnv('VITE_SMTP_USER'),
    pass: getEnv('VITE_SMTP_PASS'),
    from: getEnv('VITE_EMAIL_FROM'),
  },
  google: {
    clientId: getEnv('VITE_GOOGLE_CLIENT_ID'),
    clientSecret: getEnv('VITE_GOOGLE_CLIENT_SECRET'),
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
};
