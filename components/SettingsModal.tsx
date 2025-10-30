import React, { useState, useEffect } from 'react';
import { LlmConfig, LlmProvider } from '../hooks/useLlm';
import { XIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LlmConfig;
  onSave: (newConfig: LlmConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<LlmConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config, isOpen]);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  if (!isOpen) {
    return null;
  }
  
  const handleProviderChange = (provider: LlmProvider) => {
    const newConfig: LlmConfig = { ...localConfig, provider };
    // Set default models or clear fields when provider changes
    switch (provider) {
        case 'gemini':
            newConfig.model = 'gemini-2.5-pro';
            break;
        case 'openai':
            newConfig.model = 'gpt-4o';
            break;
        case 'custom':
            newConfig.model = 'llama3';
            break;
    }
    setLocalConfig(newConfig);
  }

  const renderProviderSettings = () => {
    return (
        <>
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="model">Model Name</label>
                <input
                    id="model"
                    type="text"
                    value={localConfig.model}
                    onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            {localConfig.provider !== 'gemini' && (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="apiKey">API Key</label>
                        <input
                            id="apiKey"
                            type="password"
                            value={localConfig.apiKey || ''}
                            onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                     {localConfig.provider === 'custom' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="baseUrl">Base URL (e.g., http://localhost:11434/v1)</label>
                            <input
                                id="baseUrl"
                                type="text"
                                value={localConfig.baseUrl || ''}
                                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    )}
                </>
            )}
            {localConfig.provider === 'gemini' && (
                <p className="text-sm text-slate-400">The Gemini API key is securely managed by the environment.</p>
            )}
        </>
    )
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-700">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100">LLM Provider Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XIcon />
          </button>
        </div>
        <div className="p-6">
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Provider</label>
                <div className="flex space-x-2 rounded-lg bg-slate-700 p-1">
                    {(['gemini', 'openai', 'custom'] as LlmProvider[]).map((provider) => (
                        <button
                            key={provider}
                            onClick={() => handleProviderChange(provider)}
                            className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${
                                localConfig.provider === provider
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-600/50'
                            }`}
                        >
                            {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {renderProviderSettings()}
            
        </div>
        <div className="flex justify-end p-4 bg-slate-800/50 border-t border-slate-700 rounded-b-lg">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-semibold"
            >
              Save and Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;