import { useState, useEffect } from 'react';

export type LlmProvider = 'gemini' | 'openai' | 'custom';

export interface LlmConfig {
  provider: LlmProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

const DEFAULT_CONFIG: LlmConfig = {
  provider: 'gemini',
  model: 'gemini-2.5-pro',
};

const LOCAL_STORAGE_KEY = 'llm_config';

export const useLlm = () => {
  const [config, setConfig] = useState<LlmConfig>(() => {
    try {
      const storedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedConfig) {
        return JSON.parse(storedConfig) as LlmConfig;
      }
    } catch (error) {
      console.error("Failed to parse LLM config from localStorage:", error);
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Failed to save LLM config to localStorage:", error);
    }
  }, [config]);

  return {
    llmConfig: config,
    setLlmConfig: setConfig,
  };
};