"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface SurveyContextType {
  surveyEnabled: boolean
  setSurveyEnabled: (enabled: boolean) => void
  surveyLink: string
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined)

export function SurveyProvider({ children }: { children: React.ReactNode }) {
  const [surveyEnabled, setSurveyEnabled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load survey status from localStorage
    const saved = localStorage.getItem("surveyEnabled")
    if (saved) {
      setSurveyEnabled(JSON.parse(saved))
    }
    setMounted(true)
  }, [])

  const handleSetSurveyEnabled = (enabled: boolean) => {
    setSurveyEnabled(enabled)
    localStorage.setItem("surveyEnabled", JSON.stringify(enabled))
  }

  // Get the current hostname for the survey link
  const surveyLink = typeof window !== "undefined" 
    ? `${window.location.origin}/survey`
    : "http://localhost:3000/survey"

  return (
    <SurveyContext.Provider value={{ surveyEnabled, setSurveyEnabled: handleSetSurveyEnabled, surveyLink }}>
      {children}
    </SurveyContext.Provider>
  )
}

export function useSurvey() {
  const context = useContext(SurveyContext)
  if (context === undefined) {
    throw new Error("useSurvey must be used within SurveyProvider")
  }
  return context
}
