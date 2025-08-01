export class MCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

export class PortalAPIError extends MCPError {
  constructor(message: string, statusCode: number) {
    super(message, 'PORTAL_API_ERROR', statusCode);
    this.name = 'PortalAPIError';
  }
}

export class AuthenticationError extends MCPError {
  constructor(message: string = 'API key não configurada') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends MCPError {
  constructor(message: string = 'Rate limit atingido') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof MCPError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    };
  }

  console.error('Erro não tratado:', error);
  return {
    error: {
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    },
  };
};

export const isRateLimitError = (error: any): boolean => {
  return (
    error instanceof RateLimitError ||
    (error.statusCode === 429) ||
    (error.message && error.message.includes('rate limit'))
  );
};

export const isAuthenticationError = (error: any): boolean => {
  return (
    error instanceof AuthenticationError ||
    (error.statusCode === 401) ||
    (error.statusCode === 403)
  );
}; 