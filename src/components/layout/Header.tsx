"use client";

import Link from "next/link";
import { BookOpen, Compass, GitCompare } from "lucide-react";

export type FlowStep = "home" | "upload" | "review" | "processing" | "results" | "compare";

interface HeaderProps {
  currentStep?: FlowStep;
  analysesCount?: number;
  onGoHome?: () => void;
  onStartUpload?: () => void;
  onOpenCompare?: () => void;
  onResetAll?: () => void;
}

export function Header({ currentStep, analysesCount = 0, onGoHome, onOpenCompare }: HeaderProps) {
  const brand = <><Compass size={28} strokeWidth={1.6} aria-hidden="true" /><strong>Brújula Curricular</strong><span className="brand-code">CC2020</span></>;
  return (
    <header className="app-header print:hidden">
      <div className="header-inner">
        {onGoHome ? <button disabled={currentStep === "processing"} onClick={onGoHome} className="brand">{brand}</button> : <Link href="/" className="brand">{brand}</Link>}
        {currentStep !== "processing" && <nav className="flex flex-wrap gap-3">
          {analysesCount > 0 && onOpenCompare && currentStep !== "compare" && <button className="quiet-action" onClick={onOpenCompare}><GitCompare size={16}/>Comparar ({analysesCount})</button>}
          {currentStep && currentStep !== "upload" && <Link className="quiet-action" href="/metodologia"><BookOpen size={16}/>Metodología</Link>}
        </nav>}
      </div>
    </header>
  );
}
