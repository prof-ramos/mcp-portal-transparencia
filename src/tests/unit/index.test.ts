import mcpPortalTransparencia from '../../index';

describe('MCP Portal da Transparência', () => {
  let serverInstance: any;

  beforeAll(async () => {
    serverInstance = await mcpPortalTransparencia({ config: { debug: false } });
  });

  test('should export the package information', () => {
    expect(serverInstance).toBeDefined();
    expect(serverInstance.serverInfo.name).toBe('portal-transparencia-mcp');
    expect(serverInstance.serverInfo.version).toBe('1.0.0');
    expect(serverInstance.serverInfo.description).toBe(
      'Multi-step Call Planner for Portal da Transparência API'
    );
  });

  test('package should have valid structure', () => {
    expect(typeof serverInstance).toBe('object');
    expect(typeof serverInstance.serverInfo.name).toBe('string');
    expect(typeof serverInstance.serverInfo.version).toBe('string');
    expect(typeof serverInstance.serverInfo.description).toBe('string');
  });
});
