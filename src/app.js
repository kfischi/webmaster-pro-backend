// src/app.js - WebMaster Pro Backend Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Security & Performance Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// ✅ CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://webmaster-pro-frontend-ctj8.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// ✅ Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// ✅ API Routes
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 WebMaster Pro API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      ai: '/api/ai/*',
      templates: '/api/templates/*',
      websites: '/api/websites/*',
      users: '/api/users/*'
    },
    documentation: 'https://github.com/webmaster-pro/backend#api-documentation'
  });
});

// 🤖 AI Endpoint (Basic)
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, type = 'content' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required',
        example: { prompt: 'Create content for a restaurant website' }
      });
    }

    // TODO: Integrate with OpenAI API
    const mockResponse = {
      type,
      prompt,
      generated_content: `Mock AI response for: "${prompt}". This will be replaced with real OpenAI integration.`,
      suggestions: [
        'Make it more professional',
        'Add call-to-action',
        'Include contact information',
        'Optimize for SEO'
      ],
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockResponse
    });

  } catch (error) {
    console.error('AI Generate Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate AI content'
    });
  }
});

// 🎨 Templates Endpoint (Basic)
app.get('/api/templates', (req, res) => {
  const { category, limit = 10 } = req.query;
  
  const mockTemplates = [
    {
      id: 1,
      name: 'עסק מקומי',
      description: 'תבנית מושלמת לעסקים מקומיים',
      category: 'עסקי',
      price: 2500,
      image: '/templates/local-business.jpg',
      features: ['רספונסיבי', 'SEO מותאם', 'טפסי יצירת קשר'],
      demo_url: 'https://demo.webmaster-pro.co.il/local-business'
    },
    {
      id: 2,
      name: 'רופא/קליניקה',
      description: 'עיצוב מקצועי לרופאים ובעלי מקצוע',
      category: 'רפואי',
      price: 3000,
      image: '/templates/medical.jpg',
      features: ['הזמנת תורים', 'גלריית שירותים', 'מידע רפואי'],
      demo_url: 'https://demo.webmaster-pro.co.il/medical'
    },
    {
      id: 3,
      name: 'מסעדה',
      description: 'תבנית אלגנטית למסעדות ובתי קפה',
      category: 'מזון',
      price: 2800,
      image: '/templates/restaurant.jpg',
      features: ['תפריט דיגיטלי', 'הזמנת שולחן', 'גלריית מנות'],
      demo_url: 'https://demo.webmaster-pro.co.il/restaurant'
    },
    {
      id: 4,
      name: 'חנות אונליין',
      description: 'חנות מקוונת מלאה עם עגלת קניות',
      category: 'מסחר',
      price: 4000,
      image: '/templates/ecommerce.jpg',
      features: ['עגלת קניות', 'תשלומים מאובטחים', 'ניהול מלאי'],
      demo_url: 'https://demo.webmaster-pro.co.il/ecommerce'
    }
  ];

  let filteredTemplates = mockTemplates;
  
  if (category) {
    filteredTemplates = mockTemplates.filter(t => 
      t.category.toLowerCase() === category.toLowerCase()
    );
  }

  const limitedTemplates = filteredTemplates.slice(0, parseInt(limit));

  res.json({
    success: true,
    data: limitedTemplates,
    total: filteredTemplates.length,
    categories: ['עסקי', 'רפואי', 'מזון', 'מסחר', 'חינוך', 'ספורט']
  });
});

// 👤 Basic User Info Endpoint
app.get('/api/user/info', (req, res) => {
  // TODO: Add JWT authentication
  res.json({
    success: true,
    data: {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@webmaster-pro.co.il',
      plan: 'premium',
      websites_created: 0,
      joined: new Date().toISOString()
    }
  });
});

// ❌ 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
    available_routes: [
      'GET /health',
      'GET /api',
      'POST /api/ai/generate',
      'GET /api/templates',
      'GET /api/user/info'
    ]
  });
});

// ❌ Global Error Handler
app.use((error, req, res, next) => {
  console.error('Global Error:', error);
  
  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`
  🚀 WebMaster Pro Backend Server Running!
  
  📍 Port: ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  🔗 Health Check: http://localhost:${PORT}/health
  📡 API Endpoint: http://localhost:${PORT}/api
  
  🎯 Ready to build amazing websites with AI! 🤖✨
  `);
});

module.exports = app;
