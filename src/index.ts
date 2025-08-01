import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { MCPPortalServer } from './server';

// Optional: Define configuration schema to require configuration at connection time
// export const configSchema = z.object({
//   debug: z.boolean().default(false).describe("Enable debug logging")
// });

export default async function ({ config }: { config: z.infer<z.ZodObject<{ debug: z.ZodDefault<z.ZodBoolean>; }>> }) {
  const portalServer = new MCPPortalServer();
  await portalServer.initialize();

  // Return the underlying McpServer instance
  return portalServer.getServer();
}