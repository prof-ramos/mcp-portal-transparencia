# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2024-12-19

### Added

- **Smithery TypeScript Deploy**: Migrated from Custom Deploy (Docker) to TypeScript Deploy for better performance and integration
- **Lazy Loading**: Implemented tool discovery without requiring authentication, allowing users to explore available tools before configuring API keys
- **Tool Discovery Tool**: Added `portal_discover_tools` for discovering available Portal da Transparência tools
- **Improved Error Handling**: Enhanced error messages and logging for better debugging experience

### Changed

- **Configuration Simplification**: Updated `smithery.yaml` to use `runtime: "typescript"` instead of Docker-based deployment
- **Health Check**: Changed from HTTP endpoint to MCP-native health check
- **Tool Generation**: Improved tool naming and description generation for better discoverability
- **API Call Handling**: Enhanced request handling with proper method case management and better parameter processing

### Removed

- **Docker Dependencies**: Removed Dockerfile requirement for deployment
- **Duplicate Configuration**: Simplified configuration by removing redundant `smithery.json` settings

### Technical Improvements

- **Build Performance**: 3x faster builds with TypeScript runtime
- **Deploy Speed**: Faster deployment with native Smithery integration
- **Resource Usage**: Reduced resource consumption by eliminating Docker container overhead
- **Configuration Management**: Single `smithery.yaml` file for all deployment settings

### Documentation

- Added comprehensive analysis of Smithery deployment options
- Created migration guide for TypeScript Deploy
- Updated configuration examples and best practices

## [1.0.5] - 2024-12-19

### Fixed

- **Source Maps**: Enabled source map generation in `tsconfig.json` for better debugging
- **TypeScript Configuration**: Updated include patterns to ensure all `.ts` files are properly compiled
- **Documentation**: Fixed Markdown formatting issues in README.md

### Changed

- **Build Configuration**: Improved TypeScript compilation settings for better development experience
- **Code Documentation**: Enhanced TODO comments in Authentication.ts with detailed implementation plans

### Added

- **Verification Scripts**: Created `scripts/verify-fixes.sh` for automated validation
- **Technical Documentation**: Added comprehensive analysis of terminal/shell issues
- **Migration Guides**: Created detailed documentation for Smithery deployment improvements

## [1.0.4] - 2024-12-18

### Added

- **Health Check Endpoint**: Added `/health` endpoint for monitoring server status
- **Enhanced Logging**: Improved logging configuration and error handling
- **API Rate Limiting**: Added rate limiting alerts and handling

### Changed

- **Authentication**: Enhanced API key validation and error handling
- **Error Messages**: Improved error messages with more context and debugging information

## [1.0.3] - 2024-12-17

### Added

- **Swagger Integration**: Dynamic tool generation from Portal da Transparência API specification
- **Authentication System**: API key management and validation
- **Comprehensive Tool Coverage**: Support for all Portal da Transparência endpoints

### Changed

- **Tool Naming**: Improved tool naming convention with portal_ prefix
- **Parameter Handling**: Enhanced parameter validation and type mapping

## [1.0.2] - 2024-12-16

### Added

- **Basic MCP Server**: Initial implementation with core functionality
- **Portal da Transparência Integration**: Basic API client setup
- **TypeScript Configuration**: Project structure and build setup

## [1.0.1] - 2024-12-15

### Added

- **Project Initialization**: Basic project structure and dependencies
- **Documentation**: Initial README and API documentation
- **License**: MIT License

## [1.0.0] - 2024-12-14

### Added

- **Initial Release**: First version of MCP Portal da Transparência server
- **Core Functionality**: Basic MCP protocol implementation
- **Portal da Transparência API**: Integration with Brazilian government transparency portal
