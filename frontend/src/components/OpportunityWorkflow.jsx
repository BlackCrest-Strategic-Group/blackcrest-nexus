/**
 * OpportunityWorkflow.jsx
 * Parent controller for the 4-step Opportunity Workflow:
 *   1. Upload Opportunity  (UploadStep)
 *   2. Opportunity Analysis (AnalysisStep)
 *   3. Execution Planning   (ExecutionStep)
 *   4. Funding Assessment   (FundingStep)
 *
 * Uses useReducer to persist data across steps so that navigating back
 * never loses previously entered values.
 */
import React, { useReducer } from "react";
import UploadStep     from "./UploadStep.jsx";
import AnalysisStep   from "./AnalysisStep.jsx";
import ExecutionStep  from "./ExecutionStep.jsx";
import FundingStep    from "./FundingStep.jsx";

/* ── Step definitions ── */
const STEPS = [
  { id: 0, label: "Upload Opportunity"  },
  { id: 1, label: "Opportunity Analysis" },
  { id: 2, label: "Execution Planning"  },
  { id: 3, label: "Funding Assessment"  },
];

/* ── Reducer ── */
const initialState = {
  step:           0,
  analysisResult: null,   // data from Step 1 AI call
  executionPlan:  null,   // { labor, materials, overhead, total } from Step 3
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_ANALYSIS":
      // Analysis complete: store result and advance to Step 2
      return { ...state, analysisResult: action.payload, step: 1 };
    case "NEXT":
      return { ...state, step: Math.min(state.step + 1, STEPS.length - 1) };
    case "BACK":
      return { ...state, step: Math.max(state.step - 1, 0) };
    case "SET_EXECUTION":
      // Execution plan saved: store and advance to Step 4
      return { ...state, executionPlan: action.payload, step: 3 };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

/* ── Progress indicator ── */
function ProgressBar({ currentStep }) {
  return (
    <div className="card mb-6">
      {/* Step labels + connectors */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, idx) => {
          const isComplete = idx < currentStep;
          const isActive   = idx === currentStep;

          return (
            <React.Fragment key={s.id}>
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    isComplete
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : isActive
                      ? "bg-navy-600 border-navy-600 text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}
                >
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                {/* Step label – hidden on mobile to avoid overflow */}
                <span
                  className={`hidden sm:block text-[10px] font-semibold tracking-wide text-center max-w-[80px] leading-tight ${
                    isActive ? "text-navy-700" : isComplete ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 rounded-full transition-all duration-300"
                  style={{ background: idx < currentStep ? "#10b981" : "#e2e8f0" }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile: show current step name below bar */}
      <p className="sm:hidden text-xs text-center text-navy-700 font-semibold mt-3">
        Step {currentStep + 1}: {STEPS[currentStep].label}
      </p>
    </div>
  );
}

/* ── Main component ── */
export default function OpportunityWorkflow() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, analysisResult, executionPlan } = state;

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Top progress indicator */}
      <ProgressBar currentStep={step} />

      {/* Step 1 – Upload */}
      {step === 0 && (
        <UploadStep
          onComplete={(result) => dispatch({ type: "SET_ANALYSIS", payload: result })}
        />
      )}

      {/* Step 2 – Analysis */}
      {step === 1 && (
        <AnalysisStep
          analysisResult={analysisResult}
          onNext={() => dispatch({ type: "NEXT" })}
          onBack={() => dispatch({ type: "BACK" })}
        />
      )}

      {/* Step 3 – Execution Planning */}
      {step === 2 && (
        <ExecutionStep
          analysisResult={analysisResult}
          executionPlan={executionPlan}
          onComplete={(plan) => dispatch({ type: "SET_EXECUTION", payload: plan })}
          onBack={() => dispatch({ type: "BACK" })}
        />
      )}

      {/* Step 4 – Funding Assessment */}
      {step === 3 && (
        <FundingStep
          executionPlan={executionPlan}
          analysisResult={analysisResult}
          onBack={() => dispatch({ type: "BACK" })}
        />
      )}

      {/* Allow restarting the workflow from any step (except the first) */}
      {step > 0 && (
        <div className="text-center pt-2">
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
          >
            Start over with a new opportunity
          </button>
        </div>
      )}
    </div>
  );
}
