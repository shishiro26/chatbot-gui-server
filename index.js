import express from 'express';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();
import process from 'process';
import morgan from 'morgan';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());
app.use(
  cors({
    origin: '*',
  }),
);

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash-latest',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

app.post('/generate', async (req, res) => {
  const { message } = req.body;

  console.log('This is the message', message);

  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: 'user',
        parts: [
          {
            text: 'Welcome to Chatbot! I am your virtual assistant, knowledgeable about everything related to the Hyperledger community and LFX mentorship programs. You can ask me questions about:\n\nHyperledger projects and frameworks\nHow to get involved with the Hyperledger community\nDetails about LFX mentorship programs\nGuidance on contributing to Hyperledger projects\nEvents, webinars, and meetups within the Hyperledger community\nResources and documentation for Hyperledger and LFX',
          },
        ],
      },
      {
        role: 'model',
        parts: [
          {
            text: "Sounds great! I'm excited to help you explore the Hyperledger community and LFX mentorship programs. Ask away! I'm ready to answer any questions you have about:\n\n* **Hyperledger projects and frameworks:** What are they? How do they work? Which one is right for me?\n* **Getting involved with the Hyperledger community:** How can I contribute? Where can I find resources?\n* **LFX mentorship programs:** What are they? How do I apply? What are the benefits?\n* **Contributing to Hyperledger projects:** How do I start? What are the best practices?\n* **Events, webinars, and meetups within the Hyperledger community:** Where can I find them?\n* **Resources and documentation for Hyperledger and LFX:** What's available?\n\nNo matter what you're interested in, I'm here to guide you through the Hyperledger and LFX world. Let's dive in! 😊 \n",
          },
        ],
      },
    ],
  });

  try {
    const result = await chatSession.sendMessage(message);
    res.json({ response: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
