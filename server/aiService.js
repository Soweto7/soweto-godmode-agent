const axios = require('axios');
const cache = require('./cacheService');

const providerConfigs = {
  jules: {
    apiKey: process.env.JULES_API_KEY,
    apiUrl: 'https://api.jules.ai/v1/chat/completions',
    model: 'jules-1.5-pro',
    getRequestBody: (message) => ({
      model: 'jules-1.5-pro',
      messages: [{ role: 'user', content: message }],
    }),
    getResponse: (data) => data.choices[0].message.content,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    getRequestBody: (message) => ({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: message }],
    }),
    getResponse: (data) => data.choices[0].message.content,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`,
    getRequestBody: (message) => ({
        contents: [{ parts: [{ text: message }] }],
    }),
    getResponse: (data) => data.candidates[0].content.parts[0].text,
    getRequestConfig: (apiKey) => ({ headers: { 'x-goog-api-key': apiKey } }),
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-8b-8192',
     getRequestBody: (message) => ({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: message }],
    }),
    getResponse: (data) => data.choices[0].message.content,
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'google/gemini-flash-1.5',
     getRequestBody: (message) => ({
      model: 'google/gemini-flash-1.5',
      messages: [{ role: 'user', content: message }],
    }),
    getResponse: (data) => data.choices[0].message.content,
  },
  ollama: {
    apiUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat',
    model: process.env.OLLAMA_MODEL || 'llama3',
    getRequestBody: (message) => ({
      model: process.env.OLLAMA_MODEL || 'llama3',
      prompt: message,
      stream: false,
    }),
    getResponse: (data) => data.message.content,
  },
};

const defaultPriority = ['jules', 'openai', 'gemini', 'groq', 'openrouter', 'ollama'];
const providerPriority = process.env.AI_PRIORITY ? process.env.AI_PRIORITY.split(',') : defaultPriority;

async function getAIReply(message, requestedProvider) {
  const cached = cache.get(message);
  if (cached) {
    console.log(`Cache hit for prompt: "${message.substring(0, 50)}..." from provider: ${cached.provider}`);
    return cached.response;
  }

  const providersToTry = requestedProvider ? [requestedProvider, ...providerPriority.filter(p => p !== requestedProvider)] : providerPriority;

  for (const provider of providersToTry) {
    if (providerConfigs[provider]) {
      try {
        const reply = await callAIProvider(message, provider);
        cache.set(message, reply, provider);
        return reply;
      } catch (error) {
        console.warn(`Provider ${provider} failed: ${error.message}. Falling back to next provider...`);
      }
    } else {
        console.warn(`Provider ${provider} is not configured.`);
    }
  }

  throw new Error('All configured AI providers failed.');
}

async function callAIProvider(message, provider) {
  const config = providerConfigs[provider];
  if (!config) throw new Error(`Provider ${provider} not found.`);

  if (config.apiKey === undefined && provider !== 'ollama') {
      throw new Error(`API key for ${provider} is not configured.`);
  }

  const headers = { 'Content-Type': 'application/json' };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  let requestConfig = { headers };
  if (config.getRequestConfig) {
      requestConfig = { ...requestConfig, ...config.getRequestConfig(config.apiKey) };
      if(provider === 'gemini') delete requestConfig.headers['Authorization'] // Gemini uses a different auth header
  }

  const body = config.getRequestBody(message);
  const apiUrl = provider === 'gemini' ? `${config.apiUrl}?key=${config.apiKey}` : config.apiUrl;

  const response = await axios.post(apiUrl, body, requestConfig);
  return config.getResponse(response.data);
}

module.exports = { getAIReply };
