const axios = require('axios');

const providers = {
  jules: {
    apiKey: process.env.JULES_API_KEY,
    apiUrl: 'https://api.jules.ai/v1/chat/completions', // Placeholder URL
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    apiUrl: 'https://api.openai.com/v1/chat/completions',
  },
  ollama: {
    apiKey: null, // No API key needed for local Ollama
    apiUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat',
  },
};

async function getAIReply(message, provider = 'jules') {
  const selectedProvider = providers[provider] || providers.jules;
  const fallbackProvider = provider === 'jules' ? providers.openai : providers.jules;

  try {
    return await callAIProvider(message, selectedProvider);
  } catch (error) {
    console.warn(`Provider ${provider} failed. Falling back...`, error.message);
    try {
      return await callAIProvider(message, fallbackProvider);
    } catch (fallbackError) {
      console.error('Fallback provider also failed.', fallbackError.message);
      throw new Error('All AI providers are currently unavailable.');
    }
  }
}

async function callAIProvider(message, providerConfig) {
  if (!providerConfig.apiKey && providerConfig !== providers.ollama) {
    throw new Error(`API key for ${providerConfig.apiUrl} is not configured.`);
  }

  const headers = {
    'Content-Type': 'application/json',
  };
  if (providerConfig.apiKey) {
    headers['Authorization'] = `Bearer ${providerConfig.apiKey}`;
  }

  const body = {
    model: 'default-model', // This should be configured per provider
    messages: [{ role: 'user', content: message }],
  };

  // Adjust body for different providers as needed
  if (providerConfig === providers.ollama) {
    body.model = process.env.OLLAMA_MODEL || 'llama3';
    delete body.messages; // Ollama has a slightly different format
    body.prompt = message;
    body.stream = false;
  } else if (providerConfig === providers.openai) {
    body.model = 'gpt-4o';
  } else if (providerConfig === providers.jules) {
    body.model = 'jules-1.5-pro'; // Placeholder model
  }

  const response = await axios.post(providerConfig.apiUrl, body, { headers });

  if (providerConfig === providers.ollama) {
      return response.data.message.content;
  }

  return response.data.choices[0].message.content;
}

module.exports = { getAIReply };
