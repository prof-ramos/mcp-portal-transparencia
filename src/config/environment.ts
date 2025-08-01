export interface Environment {
  PORTAL_API_KEY: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  NODE_ENV: 'development' | 'production';
}

export const getEnvironment = (): Environment => {
  const required = ['PORTAL_API_KEY'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias: ${missing.join(', ')}`);
  }

  return {
    PORTAL_API_KEY: process.env.PORTAL_API_KEY!,
    LOG_LEVEL: (process.env.LOG_LEVEL as Environment['LOG_LEVEL']) || 'info',
    NODE_ENV: (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
  };
}; 