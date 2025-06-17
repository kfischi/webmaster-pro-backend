// src/services/openai.js - OpenAI Integration Service
const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.initialized = !!process.env.OPENAI_API_KEY;
    
    if (!this.initialized) {
      console.warn('⚠️ OpenAI API key not found. AI features will use mock responses.');
    } else {
      console.log('🤖 OpenAI service initialized successfully!');
    }
  }

  // 🎨 Generate website content based on business description
  async generateWebsiteContent(businessType, description, options = {}) {
    try {
      if (!this.initialized) {
        return this.getMockWebsiteContent(businessType, description);
      }

      const prompt = `
        You are a professional web content writer specializing in Hebrew content for Israeli businesses.
        
        Business Type: ${businessType}
        Description: ${description}
        
        Create professional website content in Hebrew including:
        1. Main headline (כותרת ראשית)
        2. Business description (תיאור העסק)
        3. Services/Products section (שירותים/מוצרים)
        4. About us section (אודותינו)
        5. Contact call-to-action (קריאה לפעולה)
        
        Make it engaging, professional, and optimized for Israeli customers.
        Use modern Hebrew business language.
        Keep each section concise but impactful.
        
        Format as JSON with sections: headline, description, services, about, cta
      `;

      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional Hebrew copywriter creating website content for Israeli businesses. Always respond in Hebrew with professional, engaging content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      
      // Try to parse as JSON, fallback to structured text
      try {
        return JSON.parse(content);
      } catch (parseError) {
        return this.parseUnstructuredContent(content, businessType);
      }

    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getMockWebsiteContent(businessType, description);
    }
  }

  // 🔍 Generate SEO optimized meta tags
  async generateSEOContent(businessType, description, targetKeywords = []) {
    try {
      if (!this.initialized) {
        return this.getMockSEOContent(businessType, description);
      }

      const prompt = `
        Create SEO-optimized meta content in Hebrew for:
        Business: ${businessType}
        Description: ${description}
        Keywords: ${targetKeywords.join(', ')}
        
        Generate:
        1. Title tag (50-60 characters)
        2. Meta description (150-160 characters)
        3. H1 headline
        4. 5 relevant keywords in Hebrew
        5. Alt text for main image
        
        Optimize for Israeli search behavior and Hebrew SEO best practices.
        Format as JSON.
      `;

      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert Hebrew SEO specialist. Create compelling meta content that ranks well on Israeli Google searches."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.5
      });

      const content = response.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
        return this.getMockSEOContent(businessType, description);
      }

    } catch (error) {
      console.error('SEO Generation Error:', error);
      return this.getMockSEOContent(businessType, description);
    }
  }

  // 💬 AI Chat Assistant
  async chatAssistant(userMessage, context = {}) {
    try {
      if (!this.initialized) {
        return this.getMockChatResponse(userMessage);
      }

      const systemPrompt = `
        You are WebMaster Pro AI Assistant - a helpful website building expert.
        You help users create professional websites in Hebrew.
        
        Your capabilities:
        - Website design advice
        - Content suggestions
        - SEO optimization tips
        - Business growth strategies
        - Technical support
        
        Always respond in Hebrew, be helpful and professional.
        Keep responses concise but informative.
      `;

      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      });

      return {
        message: response.choices[0].message.content,
        suggestions: [
          "איך אפשר לשפר את העיצוב?",
          "מה חשוב לכלול באתר?",
          "איך מקדמים אתר ב-SEO?",
          "איזה תבנית הכי מתאימה לי?"
        ]
      };

    } catch (error) {
      console.error('Chat Assistant Error:', error);
      return this.getMockChatResponse(userMessage);
    }
  }

  // 🎨 Generate design suggestions
  async generateDesignSuggestions(businessType, preferences = {}) {
    try {
      if (!this.initialized) {
        return this.getMockDesignSuggestions(businessType);
      }

      const prompt = `
        Suggest professional website design elements for a ${businessType} business.
        
        Include:
        1. Color scheme (3-4 colors with hex codes)
        2. Typography suggestions
        3. Layout recommendations
        4. Key sections to include
        5. Visual elements suggestions
        
        Make it modern, professional and suitable for Israeli market.
        Format as JSON.
      `;

      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional web designer specializing in modern, conversion-optimized websites for Israeli businesses."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
        return this.getMockDesignSuggestions(businessType);
      }

    } catch (error) {
      console.error('Design Suggestions Error:', error);
      return this.getMockDesignSuggestions(businessType);
    }
  }

  // 🔄 Mock responses for when OpenAI is not available
  getMockWebsiteContent(businessType, description) {
    return {
      headline: `${businessType} מקצועי ואמין`,
      description: `אנחנו מתמחים בשירותי ${businessType} איכותיים עם ניסיון של שנים בתחום. ${description}`,
      services: [
        `שירותי ${businessType} מקצועיים`,
        "ייעוץ אישי ומותאם",
        "שירות אמין ואיכותי",
        "תמיכה מלאה ללקוחות"
      ],
      about: `אנחנו צוות מקצועי ומנוסה בתחום ${businessType}. אנו מתחייבים לספק שירות ברמה הגבוהה ביותר לכל לקוח.`,
      cta: "צרו קשר עוד היום לקבלת ייעוץ חינם!"
    };
  }

  getMockSEOContent(businessType, description) {
    return {
      title: `${businessType} מקצועי | שירות איכותי בישראל`,
      description: `שירותי ${businessType} מקצועיים ואמינים. ניסיון רב, שירות איכותי ומחירים הוגנים. צרו קשר לייעוץ חינם!`,
      h1: `${businessType} מקצועי ואמין בישראל`,
      keywords: [businessType, "שירות מקצועי", "ישראל", "איכות", "אמין"],
      alt: `תמונה של שירותי ${businessType} מקצועיים`
    };
  }

  getMockChatResponse(userMessage) {
    return {
      message: "אני כאן לעזור לך לבנות אתר מקצועי! אמנם זה תגובה דמו (לא OpenAI אמיתי), אבל אני יכול לעזור עם עצות כלליות על בניית אתרים.",
      suggestions: [
        "איך בוחרים תבנית מתאימה?",
        "מה כולל אתר מקצועי?",
        "איך מקדמים אתר ברשת?",
        "כמה עולה אתר איכותי?"
      ]
    };
  }

  getMockDesignSuggestions(businessType) {
    return {
      colors: {
        primary: "#2563eb",
        secondary: "#1e40af",
        accent: "#3b82f6",
        background: "#f8fafc"
      },
      typography: {
        heading: "Heebo Bold",
        body: "Heebo Regular",
        size: "16px base size"
      },
      layout: [
        "Header עם לוגו ותפריט",
        "Hero section עם כותרת ראשית",
        "Services/Products section",
        "About section",
        "Contact section"
      ],
      sections: [
        "דף בית",
        "אודותינו",
        "השירותים שלנו",
        "יצירת קשר",
        "גלריה"
      ]
    };
  }

  parseUnstructuredContent(content, businessType) {
    // Basic parsing if JSON parsing fails
    return {
      headline: `${businessType} מקצועי`,
      description: content.substring(0, 200) + "...",
      services: ["שירות מקצועי", "ייעוץ אישי", "תמיכה מלאה"],
      about: "אנחנו צוות מקצועי ומנוסה",
      cta: "צרו קשר עוד היום!"
    };
  }
}

module.exports = new OpenAIService();
