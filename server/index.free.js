#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from "./server.js";
// An empty or unexpanded setting from the host means "not set".
const lang = process.env.INVOICE_TENKEN_LANG;
if (lang !== undefined && (lang.trim() === '' || lang.includes('${')))
    delete process.env.INVOICE_TENKEN_LANG;
const server = createServer('free');
await server.connect(new StdioServerTransport());
