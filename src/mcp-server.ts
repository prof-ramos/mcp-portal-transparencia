import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  InitializeRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import { OpenAPI } from 'openapi-types';
import { Authentication } from './core/Authentication.js';
import { SwaggerLoader } from './core/SwaggerLoader.js';
import { Logger } from './logging/Logger.js';
import { startHealthServer } from "./health";

export class MCPPortalServer {
  private server: Server;
  private swaggerLoader: SwaggerLoader;
  private auth: Authentication;
  private logger: Logger;
  private tools: Map<string, any> = new Map();
  private spec: OpenAPI.Document | null = null;

  constructor() {
    // Configure logger
    const logLevel = process.env.LOG_LEVEL || 'info';
    this.logger = new Logger(logLevel);

    // Initialize server
    this.server = new Server(
      {
        name: 'portal-transparencia-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Configure authentication
    const apiKey = process.env.PORTAL_API_KEY;
    const authConfig = apiKey ? { apiKey } : {};
    this.auth = new Authentication(authConfig, this.logger);

    // Initialize components with auth headers if API key is available
    const authHeaders = apiKey ? this.auth.getAuthHeaders() : undefined;
    this.swaggerLoader = new SwaggerLoader(
      'https://api.portaldatransparencia.gov.br/v3/api-docs',
      this.logger,
      authHeaders
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Handle initialization request
    this.server.setRequestHandler(InitializeRequestSchema, async _request => {
      return {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'portal-transparencia-mcp',
          version: '1.0.0',
        },
      };
    });

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Lazy loading: Return tool information without requiring authentication
      // This allows users to discover available tools before configuring API keys

      if (!this.spec) {
        // If spec is not loaded yet, return basic tool information
        return {
          tools: [
            {
              name: "portal_discover_tools",
              description: "Descobrir ferramentas disponíveis no Portal da Transparência",
              inputSchema: {
                type: "object",
                properties: {},
                required: []
              }
            }
          ]
        };
      }

      // Return all available tools with their descriptions
      const tools = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description || `Consulta ${tool.path}`,
        inputSchema: tool.inputSchema
      }));

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      // Handle tool discovery without authentication
      if (name === "portal_discover_tools") {
        return {
          content: [
            {
              type: "text",
              text: `Portal da Transparência MCP Server

Este servidor oferece acesso a todos os endpoints da API do Portal da Transparência do Brasil.

Para usar as ferramentas, configure a variável de ambiente PORTAL_API_KEY com sua chave de API.

Ferramentas disponíveis:
${this.spec ? Array.from(this.tools.values()).map(tool =>
                `- ${tool.name}: ${tool.description || `Consulta ${tool.path}`}`
              ).join('\n') : 'Carregando ferramentas...'}

Para obter uma API key, visite: https://api.portaldatransparencia.gov.br/api-de-dados/cadastrar-email`
            }
          ]
        };
      }

      if (!this.tools.has(name)) {
        throw new Error(`Ferramenta não encontrada: ${name}`);
      }

      const tool = this.tools.get(name);
      return await this.executeApiCall(tool.method, tool.path, tool.operation, args || {});
    });
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Iniciando carregamento da especificação Swagger...');

      // Load spec
      this.spec = await this.swaggerLoader.loadSpec();

      this.logger.info('Especificação carregada, gerando ferramentas MCP...');
      this.generateMCPTools();

      this.logger.info(`Servidor MCP inicializado com ${this.tools.size} ferramentas`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Falha ao inicializar servidor MCP', { error: errorMessage });
      throw error;
    }
  }

  private generateMCPTools(): void {
    if (!this.spec?.paths) {
      this.logger.warn('Nenhum path encontrado na especificação');
      return;
    }

    for (const [path, pathItem] of Object.entries(this.spec.paths)) {
      if (!pathItem) continue;

      for (const [method, operation] of Object.entries(pathItem)) {
        if (typeof operation !== 'object' || !operation || Array.isArray(operation)) continue;

        const operationObj = operation as OpenAPI.Operation;
        if (!operationObj.operationId) continue;

        const tool = this.createMCPTool(operationObj, method, path);
        this.tools.set(tool.name, tool);
      }
    }
  }

  private generateToolName(operationId: string, _method: string, path: string): string {
    // Generate descriptive tool names with portal_ prefix
    const cleanOperationId = operationId
      .replace(/UsingGET\d*|UsingPOST\d*|UsingPUT\d*|UsingDELETE\d*/gi, '')
      .replace(/Controller/gi, '')
      .toLowerCase();

    // Extract category from path
    const pathParts = path.split('/').filter(part => part && !part.startsWith('{'));
    const category = pathParts[pathParts.length - 1] || 'geral';

    // Create the base name
    let toolName = `portal_${category}_${cleanOperationId}`.replace(/[^a-z0-9_]/g, '_');

    // Ensure the name doesn't exceed 64 characters (MCP limit)
    if (toolName.length > 64) {
      // Truncate while keeping the portal_ prefix and trying to preserve readability
      const prefix = 'portal_';
      const maxLength = 64;
      const availableLength = maxLength - prefix.length;

      // Try to keep a portion of category and operationId
      const categoryPart = category.substring(0, Math.min(category.length, 12));
      const operationPart = cleanOperationId.substring(
        0,
        availableLength - categoryPart.length - 1
      );

      toolName = `${prefix}${categoryPart}_${operationPart}`.replace(/[^a-z0-9_]/g, '_');

      // Final check - if still too long, truncate
      if (toolName.length > 64) {
        toolName = toolName.substring(0, 64);
      }
    }

    return toolName;
  }

  private createMCPTool(operation: OpenAPI.Operation, method: string, path: string) {
    const toolName = this.generateToolName(operation.operationId!, method, path);

    const properties: Record<string, any> = {};
    const required: string[] = [];

    // Process parameters
    if (operation.parameters) {
      for (const param of operation.parameters) {
        if ('$ref' in param) continue;

        const parameter = param as any; // Simplified type handling
        if (parameter.name && !properties[parameter.name]) {
          properties[parameter.name] = {
            type: this.mapOpenAPITypeToJSON(parameter.schema?.type || 'string'),
            description: parameter.description || `Parâmetro ${parameter.name}`,
          };

          if (parameter.required) {
            required.push(parameter.name);
          }
        }
      }
    }

    // Process request body if available
    const requestBody = (operation as any).requestBody;
    if (requestBody && !('$ref' in requestBody)) {
      const content = requestBody.content?.['application/json'];
      if (content?.schema && !('$ref' in content.schema)) {
        const schema = content.schema as any;
        if (schema.properties) {
          for (const [propName, propSchema] of Object.entries(schema.properties)) {
            if (propSchema && typeof propSchema === 'object' && !('$ref' in propSchema)) {
              const prop = propSchema as any;
              properties[propName] = {
                type: this.mapOpenAPITypeToJSON(prop.type || 'string'),
                description: prop.description || `Propriedade ${propName}`,
              };
            }
          }
        }
      }
    }

    return {
      name: toolName,
      description: operation.summary || operation.description || `Consulta ${path}`,
      inputSchema: {
        type: 'object',
        properties,
        required,
      },
      method,
      path,
      operation,
    };
  }

  private mapOpenAPITypeToJSON(type: string | undefined): string {
    switch (type) {
      case 'integer':
        return 'number';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return 'array';
      case 'object':
        return 'object';
      default:
        return 'string';
    }
  }

  private async executeApiCall(
    method: string,
    path: string,
    _operation: any,
    args: Record<string, any>
  ) {
    try {
      // Ensure method is uppercase for HTTP requests
      const httpMethod = method.toUpperCase();

      this.logger.info(`Executando chamada API`, {
        method: httpMethod,
        path,
        args: Object.keys(args),
      });

      // Build URL with query parameters
      let url = `https://api.portaldatransparencia.gov.br${path}`;
      const queryParams = new URLSearchParams();

      // Add arguments as query parameters
      for (const [key, value] of Object.entries(args)) {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      // Prepare request options
      const requestOptions: any = {
        method: httpMethod,
        headers: {
          'Content-Type': 'application/json',
          ...this.auth.getAuthHeaders(),
        },
      };

      // Add body for POST/PUT requests if there are arguments
      if ((httpMethod === 'POST' || httpMethod === 'PUT') && Object.keys(args).length > 0) {
        requestOptions.body = JSON.stringify(args);
      }

      this.logger.debug('Request details', { url, method: httpMethod, headers: requestOptions.headers });

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Erro na chamada API', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });

        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      this.logger.info('Chamada API executada com sucesso', {
        method: httpMethod,
        path,
        responseSize: JSON.stringify(data).length,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Falha na execução da chamada API', {
        method,
        path,
        error: errorMessage,
      });

      throw new Error(`Falha na execução: ${errorMessage}`);
    }
  }

  async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      this.logger.info('MCP server initialized. Waiting for stdio messages...');
      this.logger.info('Servidor MCP Portal da Transparência iniciado com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Falha ao iniciar servidor MCP', { error: errorMessage });
      throw error;
    }
  }
}

// Initialize and start the server
async function main() {
  const server = new MCPPortalServer();
  try {
    await server.initialize();
    await server.start();
    startHealthServer(3000);
  } catch (error) {
    // Use stderr explicitly to avoid interfering with MCP protocol
    process.stderr.write(`Erro ao iniciar servidor MCP: ${error}\n`);
    process.exit(1);
  }
}

// Only run main if this file is the entry point
if (require.main === module) {
  main();
}
