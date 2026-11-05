"use client";

import { useCallback, useEffect, useState } from "react";
import { buildDemoAnalysis, DEMO_ID } from "@/data/demo-curriculum";
import type { StoredAnalysis } from "@/types";

const STORAGE_KEY = "cc2020_session_analyses_v1";
const ACTIVE_KEY = "cc2020_active_analysis_id_v1";

/**
 * Conserva en sessionStorage las carreras analizadas durante la sesión actual,
 * para permitir comparar dos o más planes de estudio y navegar a la página de
 * metodología sin perder el trabajo. No guarda documentos originales.
 */
export function useSessionAnalyses() {
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const act = sessionStorage.getItem(ACTIVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredAnalysis[];
        if (Array.isArray(parsed)) setAnalyses(parsed);
      }
      if (act) setActiveId(act);
    } catch {
      // Si sessionStorage está bloqueado, funciona en memoria.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
      if (activeId) sessionStorage.setItem(ACTIVE_KEY, activeId);
      else sessionStorage.removeItem(ACTIVE_KEY);
    } catch {
      // Ignorar errores de cuota de almacenamiento local.
    }
  }, [analyses, activeId, hydrated]);

  const upsertAnalysis = useCallback((item: StoredAnalysis) => {
    setAnalyses((prev) => {
      const idx = prev.findIndex((a) => a.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [...prev, item];
    });
    setActiveId(item.id);
  }, []);

  const loadDemo = useCallback(() => {
    const demo = buildDemoAnalysis();
    upsertAnalysis(demo);
    return demo;
  }, [upsertAnalysis]);

  const removeAnalysis = useCallback((id: string) => {
    setAnalyses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      setActiveId((current) => (current === id ? (next[0]?.id ?? null) : current));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setAnalyses([]);
    setActiveId(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(ACTIVE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const activeAnalysis = analyses.find((a) => a.id === activeId) ?? null;
  const hasDemo = analyses.some((a) => a.id === DEMO_ID);

  return {
    hydrated,
    analyses,
    activeAnalysis,
    activeId,
    setActiveId,
    upsertAnalysis,
    loadDemo,
    hasDemo,
    removeAnalysis,
    clearAll,
  };
}
