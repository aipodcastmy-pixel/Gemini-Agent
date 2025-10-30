import React, { useState, useEffect } from 'react';
import { LlmConfig, LlmProvider } from '../hooks/useLlm';
import { XIcon, DatabaseIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LlmConfig;
  onSave: (newConfig: LlmConfig) => void;
  indexedDbData: Record<string, any>;
  onClearIndexedDb: () => void;
}

const PREDEFINED_MODELS: Record<Exclude<LlmProvider, 'custom'>, string[]> = {
    gemini: ['gemini-2.5-pro', 'gemini-2.5-flash'],
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
};

type SettingsTab = 'provider' | 'storage';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave, indexedDbData, onClearIndexedDb }) => {
  const [localConfig, setLocalConfig] = useState<LlmConfig>(config);
  const [activeTab, setActiveTab] = useState<SettingsTab>('provider');

  useEffect(() => {
    setLocalConfig(config);
  }, [config, isOpen]);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const handleClearStorage = () => {
    if (window.confirm("Are you sure you want to permanently delete all data in the agent's long-term memory? This cannot be undone.")) {
        onClearIndexedDb();
    }
  }

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
    const isPredefinedProvider = localConfig.provider === 'gemini' || localConfig.provider === 'openai';
    return (
        <>
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Provider</label>
                <div className="flex rounded-md bg-slate-900 p-1 gap-1">
                    <button
                        onClick={() => handleProviderChange('gemini')}
                        className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${localConfig.provider === 'gemini' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                    >
                        Gemini
                    </button>
                    <button
                        onClick={() => handleProviderChange('openai')}
                        className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${localConfig.provider === 'openai' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                    >
                        OpenAI
                    </button>
                    <button
                        onClick={() => handleProviderChange('custom')}
                        className={`w-full px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${localConfig.provider === 'custom' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                    >
                        Custom
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="model">Model Name</label>
                {isPredefinedProvider ? (
                    <div className="relative">
                        <select
                            id="model"
                            value={localConfig.model}
                            onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        >
                            {PREDEFINED_MODELS[localConfig.provider].map(modelName => (
                                <option key={modelName} value={modelName}>{modelName}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="w-5 h-5"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4"></path></svg>
                        </div>
                    </div>
                ) : (
                    <input
                        id="model"
                        type="text"
                        value={localConfig.model}
                        onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                )}
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

  const renderStorageSettings = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-slate-200">IndexedDB Storage Contents</h3>
                <button
                    onClick={handleClearStorage}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-semibold"
                >
                    Clear All Storage
                </button>
            </div>
            <div className="bg-slate-900 rounded-md p-3 h-64 overflow-y-auto border border-slate-700">
                {Object.keys(indexedDbData).length > 0 ? (
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all">
                        {JSON.stringify(indexedDbData, null, 2)}
                    </pre>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        The agent's long-term memory is empty.
                    </div>
                )}
            </div>
        </div>
    )
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-700 flex flex-col" style={{ height: '70vh' }}>
        <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-100">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XIcon />
          </button>
        </div>

        <div className="p-6 flex-grow min-h-0 flex flex-col">
            <div className="mb-6 border-b border-slate-700 flex-shrink-0">
                <div className="flex space-x-4">
                    <button 
                        onClick={() => setActiveTab('provider')}
                        className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'provider' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                        LLM Provider
                    </button>
                    <button 
                        onClick={() => setActiveTab('storage')}
                        className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'storage' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                        Agent Storage
                    </button>
                </div>
            </div>

            <div className="flex-grow min-h-0 overflow-y-auto pr-2 -mr-2">
                {activeTab === 'provider' && renderProviderSettings()}
                {activeTab === 'storage' && renderStorageSettings()}
            </div>
        </div>

        <div className="flex justify-end p-4 bg-slate-800/50 border-t border-slate-700 rounded-b-lg flex-shrink-0">
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