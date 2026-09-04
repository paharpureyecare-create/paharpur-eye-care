import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. AI Chat & Business Assistant Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, systemContext, history, erpData } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        success: true,
        fallbackMode: true,
        reply: null,
        message: 'No GEMINI_API_KEY configured. Falling back to deterministic ERP intelligence engine.'
      });
    }

    const systemInstruction = `
You are "PAHARPUR ERP AI ASSISTANT", the official intelligent AI assistant for PAHARPUR EYE CARE (an Optical Retail, Lens Wholesaler & Eye Clinic ERP).

CRITICAL RULES:
1. You understand Bengali (বাংলা), English, and Banglish. If user asks in Bengali/Banglish, answer in polite, professional Bengali (বাংলা).
2. REAL ERP DATA ONLY: You MUST use the provided real-time ERP data snapshot. NEVER invent, hallucinate or guess any patient, customer, appointment, prescription, lens stock, frame stock, sale, payment, due or medical numbers.
3. If information is not in the ERP snapshot, explicitly answer: "এই তথ্য ERP database-এ পাওয়া যায়নি।"
4. Provide clean, scannable responses with bold key metrics and actionable insights.
5. In responses mentioning a specific Customer, Patient, Order or Invoice, include structured meta hints so the UI can provide 1-click navigation buttons.
${systemContext ? `\nERP SYSTEM SNAPSHOT CONTEXT:\n${typeof systemContext === 'string' ? systemContext : JSON.stringify(systemContext)}` : ''}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    const replyText = response.text || '';
    res.json({
      success: true,
      reply: replyText
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(200).json({
      success: false,
      fallbackMode: true,
      error: error?.message || 'Gemini API call failed',
      reply: null
    });
  }
});

// 3. AI Prescription Image OCR Endpoint
app.post('/api/ai/ocr-prescription', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    const ai = getGeminiClient();

    if (!ai || !imageBase64) {
      return res.status(200).json({
        success: false,
        fallbackMode: true,
        message: 'API Key not available or missing image'
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, '');

    const promptText = `
Analyze this Eye Care / Optical Prescription image and extract the ocular refraction power and patient details.
Return ONLY valid JSON matching this exact JSON format:
{
  "patientName": "Extracted Name or empty",
  "age": 0,
  "gender": "Male" | "Female" | "Other" | "",
  "doctor": "Doctor name or empty",
  "date": "YYYY-MM-DD or empty",
  "odPower": {
    "sph": "+0.00 / -0.00 / Plano / etc",
    "cyl": "cylindrical power or empty",
    "axis": "axis degree or empty",
    "add": "addition power or empty",
    "distanceVa": "6/6, 6/9 etc",
    "nearVa": "N6, N8 etc",
    "pd": "mm or empty"
  },
  "osPower": {
    "sph": "+0.00 / -0.00 / Plano / etc",
    "cyl": "cylindrical power or empty",
    "axis": "axis degree or empty",
    "add": "addition power or empty",
    "distanceVa": "6/6, 6/9 etc",
    "nearVa": "N6, N8 etc",
    "pd": "mm or empty"
  },
  "pd": "62",
  "notes": "Any clinical advice or notes written"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64
            }
          },
          {
            text: promptText
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error('Gemini OCR error:', error);
    res.status(200).json({
      success: false,
      fallbackMode: true,
      error: error?.message || 'OCR parsing failed'
    });
  }
});

// 4. AI Voice Transcript Structured Field Extractor
app.post('/api/ai/voice-parse', async (req, res) => {
  try {
    const { transcript } = req.body;
    const ai = getGeminiClient();

    if (!ai || !transcript) {
      return res.status(200).json({
        success: false,
        fallbackMode: true,
        message: 'API Key not available or missing transcript'
      });
    }

    const promptText = `
The user spoke a voice command (in Bengali, English, or Banglish) describing a customer, patient, or ocular prescription:
Voice Transcript: "${transcript}"

Extract all structured fields into this exact JSON schema:
{
  "entityType": "patient" | "customer" | "spectacle_sale" | "prescription",
  "name": "Full name",
  "age": number or null,
  "gender": "Male" | "Female" | "Other" | null,
  "mobile": "10-digit mobile or empty",
  "address": "Address or empty",
  "odSph": "OD SPH e.g. -1.00",
  "odCyl": "OD CYL e.g. -0.50",
  "odAxis": "OD Axis e.g. 90",
  "odAdd": "OD ADD e.g. +1.50",
  "osSph": "OS SPH e.g. -1.00",
  "osCyl": "OS CYL e.g. -0.50",
  "osAxis": "OS Axis e.g. 90",
  "osAdd": "OS ADD e.g. +1.50",
  "frameBrand": "Frame brand or empty",
  "lensBrand": "Lens brand or empty",
  "advance": number or null,
  "totalPrice": number or null,
  "notes": "Any other details mentioned"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error('Gemini Voice Parse error:', error);
    res.status(200).json({
      success: false,
      fallbackMode: true,
      error: error?.message || 'Voice parsing failed'
    });
  }
});

// 5. AI Marketing Campaign Architect Endpoint
app.post('/api/ai/marketing-campaign', async (req, res) => {
  try {
    const { instruction, erpContext } = req.body;
    const ai = getGeminiClient();

    if (!ai || !instruction) {
      return res.status(200).json({
        success: false,
        fallbackMode: true,
        message: 'API key not configured or missing instruction'
      });
    }

    const systemInstruction = `
You are the "AI Optical Marketing Director" for PAHARPUR EYE CARE (an Optical Retail, Lens Wholesaler & Eye Clinic).
Create a complete, high-converting optical marketing campaign in structured JSON based on the user's instructions.
CRITICAL RULES:
1. Optical specificity: Frame brands, Blue Cut lenses, Progressive lenses, Anti-glare, Eye check-ups, UV420, Computer lenses.
2. Provide polite, engaging Bengali (বাংলা) message copy as well as English copy.
3. Use dynamic variable tags like {Customer_Name}, {Offer_Name}, {Discount}, {Start_Date}, {End_Date}, {Shop_Name}, {Shop_Mobile}, {Shop_Address}.
4. Return ONLY valid JSON matching this schema:
{
  "campaignName": "string",
  "campaignType": "Festive" | "Seasonal" | "Product Launch" | "Discount Offer" | "Reactivation" | "Follow-up" | "Birthday" | "Eye Recall" | "Due Recovery" | "Custom",
  "targetSegment": "string (e.g. Inactive Customer, Progressive Lens Customer, Blue Cut Lens Customer, High Value Customer, All Customers)",
  "offerTitle": "string",
  "discountType": "Percentage" | "Amount",
  "discountValue": number,
  "applicableProduct": "string",
  "ctaType": "Call Now" | "WhatsApp" | "Book Appointment" | "Get Direction" | "View Offer" | "Contact Shop",
  "messageBengali": "string with tags",
  "messageEnglish": "string with tags",
  "durationDays": number,
  "followUpStrategy": "string",
  "estimatedRoiHint": "string"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Instruction: "${instruction}"\nERP Context:\n${JSON.stringify(erpContext || {})}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error('Gemini Marketing Campaign error:', error);
    res.status(200).json({
      success: false,
      fallbackMode: true,
      error: error?.message || 'Campaign generation failed'
    });
  }
});

// 6. AI Multi-Tone Optical Message Writer
app.post('/api/ai/marketing-writer', async (req, res) => {
  try {
    const { topic, preferredTone, productType, discount } = req.body;
    const ai = getGeminiClient();

    if (!ai || !topic) {
      return res.status(200).json({
        success: false,
        fallbackMode: true,
        message: 'API key not configured or missing topic'
      });
    }

    const systemInstruction = `
You are the "AI Message Copywriter" for PAHARPUR EYE CARE Optical ERP.
Generate 6 distinct tone variations of a WhatsApp promotional message in both Bengali (বাংলা) and English.
Available tones: "Professional", "Friendly", "Premium", "Urgent", "Festival", "Short".
Include dynamic variables like {Customer_Name}, {Offer_Name}, {Discount}, {Shop_Name}, {Shop_Mobile}, {Shop_Address}.

Return ONLY valid JSON matching this schema:
{
  "variations": [
    {
      "tone": "Professional" | "Friendly" | "Premium" | "Urgent" | "Festival" | "Short",
      "headline": "string",
      "bengali": "string with tags",
      "english": "string with tags",
      "callToAction": "string"
    }
  ],
  "recommendedCta": "string"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Topic: "${topic}", Preferred Tone: "${preferredTone || 'Professional'}", Product: "${productType || 'General'}", Discount: "${discount || ''}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error('Gemini Marketing Writer error:', error);
    res.status(200).json({
      success: false,
      fallbackMode: true,
      error: error?.message || 'Message writing failed'
    });
  }
});

// 7. AI Customer & Campaign Insights Engine
app.post('/api/ai/marketing-insights', async (req, res) => {
  try {
    const { customerMetrics, salesTrends } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        success: false,
        fallbackMode: true,
        message: 'API key not configured'
      });
    }

    const systemInstruction = `
You are the "Optical Business Intelligence AI" for PAHARPUR EYE CARE.
Analyze the provided customer and marketing data to provide actionable business growth suggestions.
CRITICAL CONSTRAINT: Do NOT provide clinical treatment, surgical recommendations, or medical diagnosis. Stick strictly to optical business, retail lens sales, vision recall reminders, frame collection promotions, customer retention, and marketing ROI.

Return ONLY valid JSON:
{
  "topValuableSegments": [
    { "segment": "string", "insight": "string", "recommendedAction": "string" }
  ],
  "productOpportunities": [
    { "product": "string", "growthOpportunity": "string", "targetGroup": "string" }
  ],
  "retentionStrategy": {
    "inactiveCustomerCount": number,
    "suggestion": "string",
    "recommendedCampaign": "string"
  },
  "bestOffersToRun": [
    { "title": "string", "discount": "string", "expectedRoi": "string" }
  ],
  "keyTakeaways": ["string", "string", "string"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Data Metrics:\n${JSON.stringify({ customerMetrics, salesTrends })}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error('Gemini Marketing Insights error:', error);
    res.status(200).json({
      success: false,
      fallbackMode: true,
      error: error?.message || 'Insights generation failed'
    });
  }
});

// Vite middleware setup
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Paharpur Eye Care ERP Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
