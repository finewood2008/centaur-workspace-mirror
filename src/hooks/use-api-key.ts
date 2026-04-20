/**
 * useApiKey - Google AI API Key 管理 Hook
 * 存储、验证、获取用户配置的 Google Gemini API Key
 */
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "banrenma_google_api_key";
const MODEL_KEY = "banrenma_google_model";

export const GOOGLE_MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "快速响应，性价比高" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "最强推理，复杂任务" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", desc: "基础模型，速度最快" },
] as const;

interface ApiKeyState {
  key: string;
  isValid: boolean | null;
  isValidating: boolean;
  model: string;
}

export function useApiKey() {
  const [state, setState] = useState<ApiKeyState>({
    key: "",
    isValid: null,
    isValidating: false,
    model: "gemini-2.5-flash",
  });

  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    const savedModel = localStorage.getItem(MODEL_KEY);
    if (savedKey || savedModel) {
      setState((prev) => ({
        ...prev,
        key: savedKey || "",
        model: savedModel || "gemini-2.5-flash",
      }));
    }
  }, []);

  const saveKey = useCallback((newKey: string) => {
    const trimmed = newKey.trim();
    localStorage.setItem(STORAGE_KEY, trimmed);
    setState((prev) => ({ ...prev, key: trimmed, isValid: null }));
  }, []);

  const clearKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState((prev) => ({ ...prev, key: "", isValid: null, isValidating: false }));
  }, []);

  const saveModel = useCallback((model: string) => {
    localStorage.setItem(MODEL_KEY, model);
    setState((prev) => ({ ...prev, model }));
  }, []);

  const validateKey = useCallback(async (keyToValidate?: string) => {
    const k = keyToValidate || state.key;
    if (!k) return false;

    setState((prev) => ({ ...prev, isValidating: true }));
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${k}`
      );
      const valid = res.ok;
      setState((prev) => ({ ...prev, isValid: valid, isValidating: false }));
      return valid;
    } catch {
      setState((prev) => ({ ...prev, isValid: false, isValidating: false }));
      return false;
    }
  }, [state.key]);

  const getKey = useCallback(() => {
    return state.key || localStorage.getItem(STORAGE_KEY) || "";
  }, [state.key]);

  const getModel = useCallback(() => {
    return state.model || localStorage.getItem(MODEL_KEY) || "gemini-2.5-flash";
  }, [state.model]);

  return {
    apiKey: state.key,
    model: state.model,
    isValid: state.isValid,
    isValidating: state.isValidating,
    saveKey,
    clearKey,
    saveModel,
    validateKey,
    getKey,
    getModel,
    hasKey: !!state.key,
  };
}

/** 静态工具函数（不需要 Hook 时使用） */
export function getStoredApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || "";
}

export function getStoredModel(): string {
  return localStorage.getItem(MODEL_KEY) || "gemini-2.5-flash";
}

export function hasStoredApiKey(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}
