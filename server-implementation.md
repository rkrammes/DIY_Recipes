# Server Implementation Guide

This document provides the implementation details for the optimized server.js file based on the recommendations in the server-optimization.md document. The code below includes all the necessary optimizations for security, performance, and reliability.

## Required Dependencies

Before implementing these changes, install the following dependencies:

```bash
npm install helmet cors compression express-rate-limit winston express-validator uuid --save
```

## Optimized Server.js Implementation

Replace the current server.js file with the following optimized version:

```javascript
// server.js - Optimized for Production

import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import helmet from 'helmet'; // Security headers
import cors from 'cors'; // CORS handling
import compression from 'compression'; // Response compression
import rateLimit from 'express-rate-limit'; // Rate limiting
import winston from 'winston'; // Advanced logging
import { check, validationResult } from 'express-validator'; // Input validation
import { v4 as uuidv4 } from 'uuid'; // For request IDs
import path from 'path';
import { fileURLToPath } from 'url';

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Configure Winston logger
const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    isProd ? winston.format.json() : winston.format.prettyPrint()
  ),
  defaultMeta: { service: 'diy-recipes' },
  transports: [
    new winston.transports.Console(),
    // Add file transport for production
    ...(isProd ? [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ] : [])
  ]
});

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize Supabase client
let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  logger.info('Supabase client initialized successfully');
} catch (error) {
  logger.error('Error initializing Supabase client:', { error: error.message, stack: error.stack });
  process.exit(1);
}

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_CHAT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4';

// Initialize Express app
const app = express();

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  // Log request details without sensitive data
  logger.info('Incoming request', {
    id: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Track response time
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      id: req.id,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
});

// Security headers with Helmet
app.use(helmet());

// Configure Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline in the future
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:'],
    connectSrc: ["'self'", 'https://api.openai.com', process.env.SUPABASE_URL],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
}));

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3001']; // Default for development

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes by default
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  },
  keyGenerator: (req) => req.ip // Rate limit by IP
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Stricter rate limit for AI suggestion endpoint
const aiSuggestionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour
  message: {
    status: 429,
    message: 'Too many AI suggestion requests, please try again later.'
  }
});

// Serve static files with cache control
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure static file serving with caching
const staticOptions = {
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    const hashRegex = /\.[0-9a-f]{8}\./;
    
    // If the file has a hash in its name (e.g. main.abc123.js)
    // we can cache it for longer periods
    if (hashRegex.test(path)) {
      // Cache for 1 year
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      // Cache for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
};

app.use(express.static(__dirname, staticOptions));
app.use('/js', express.static(path.join(__dirname, 'js'), staticOptions));
app.use('/public', express.static(path.join(__dirname, 'public'), staticOptions));

// Input validation middleware for AI suggestion endpoint
const validateAiSuggestionRequest = [
  check('recipe').exists().withMessage('Recipe is required'),
  check('userPrompt').exists().isString().isLength({ min: 1, max: 500 })
    .withMessage('User prompt is required and must be between 1 and 500 characters')
];

// AI suggestion endpoint with validation and rate limiting
app.post('/api/ai-suggestion', 
  aiSuggestionLimiter,
  validateAiSuggestionRequest,
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation error in AI suggestion request', {
        requestId: req.id,
        errors: errors.array()
      });
      return res.status(400).json({ errors: errors.array() });
    }

    logger.info('Processing AI suggestion request', { requestId: req.id });
    
    try {
      const { recipe, userPrompt } = req.body;

      const messages = [
        { role: 'system', content: 'You are a helpful AI that suggests recipe improvements.' },
        {
          role: 'user',
          content: `Here is a recipe in JSON: ${JSON.stringify(recipe, null, 2)}
          User request: ${userPrompt}
          Suggest improvements for this recipe. Return a short summary with suggested changes.`,
        },
      ];
      
      logger.debug('Sending request to OpenAI', {
        requestId: req.id,
        model: OPENAI_MODEL
      });
      
      const response = await fetch(OPENAI_CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: messages,
          max_tokens: 300,
          temperature: 0.7,
        }),
        timeout: 10000 // 10 second timeout
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        logger.error('OpenAI API error', {
          requestId: req.id,
          status: response.status,
          error: errorData
        });
        return res.status(response.status).json({
          error: 'Error communicating with AI service',
          requestId: req.id
        });
      }
      
      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        logger.info('AI suggestion generated successfully', { requestId: req.id });
        res.json({ 
          suggestion: data.choices[0].message.content.trim(),
          requestId: req.id
        });
      } else {
        logger.error('No suggestion generated from OpenAI', {
          requestId: req.id,
          response: data
        });
        res.status(500).json({ 
          error: 'No suggestion generated.',
          requestId: req.id
        });
      }
    } catch (error) {
      logger.error('Error processing AI suggestion', {
        requestId: req.id,
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        error: 'An error occurred while processing your request.',
        requestId: req.id
      });
    }
});

// Route handlers
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log the error
  logger.error('Unhandled error', {
    requestId: req.id,
    error: err.message,
    stack: err.stack,
    status: statusCode
  });
  
  // Don't expose error details in production
  const errorResponse = {
    status: statusCode,
    message: isProd ? 'An error occurred processing your request' : err.message,
    requestId: req.id
  };
  
  res.status(statusCode).json(errorResponse);
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason.message || reason,
    stack: reason.stack || 'No stack trace available'
  });
  // Don't exit the process in production, but log it
  if (!isProd) {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  // Always exit on uncaught exceptions
  process.exit(1);
});
```

## Implementation Steps

1. Install the required dependencies as mentioned above
2. Update the .env file to include the following variables:
   - NODE_ENV=production (for production environments)
   - ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
   - RATE_LIMIT_WINDOW_MS=900000 (15 minutes in milliseconds)
   - RATE_LIMIT_MAX=100
   - LOG_LEVEL=info

3. Replace the server.js file with the optimized version

4. Test the server in development mode before deploying to production

## Key Optimizations Explained

### 1. Security Headers

The implementation uses Helmet.js to add security headers, including a Content Security Policy that restricts:
- Which domains can serve JavaScript
- Where images can be loaded from
- Which domains can be connected to via fetch/XHR
- Prevents embedding your site in iframes

### 2. CORS Configuration

The CORS policy is configured to:
- Only allow specified origins (from environment variable)
- Restrict allowed methods and headers
- Support credentials for authenticated requests
- Set appropriate cache times for preflight requests

### 3. Rate Limiting

Two levels of rate limiting are implemented:
- General API rate limiting (100 requests per 15 minutes by default)
- Stricter rate limiting for the AI suggestion endpoint (20 requests per hour)

### 4. Caching Strategy

Static assets are served with appropriate cache headers:
- Files with hash in the name (for cache busting) are cached for 1 year
- Regular files are cached for 1 day

### 5. Error Handling

A comprehensive error handling strategy is implemented:
- Centralized error handling middleware
- Different error responses for development and production
- Request IDs for tracking errors across logs
- Handling of unhandled promise rejections and uncaught exceptions

### 6. Logging

Winston logger is configured for structured logging:
- JSON format in production for easier parsing
- Pretty-printed logs in development
- Different log levels based on environment
- Request ID included in all logs for request tracing

### 7. Input Validation

Express-validator is used to validate and sanitize input:
- Schema-based validation for the AI suggestion endpoint
- Detailed validation error responses

## Conclusion

This implementation addresses all the security and performance concerns identified in the security audit and adds production-ready features to the server. The code is well-commented to explain each optimization and its purpose.