'use client'

import React, { Suspense, lazy, useState, useEffect, useRef, useCallback, Component, ErrorInfo, ReactNode } from 'react'
import { useExamStore } from '@/store/useExamStore'
import { type Application } from '@splinetool/runtime'

const Spline = lazy(() => import('@splinetool/react-spline'))

// Custom SafeErrorBoundary to capture asynchronous 3D loading crashes gracefully
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SafeErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Caught error inside 3D Spline Canvas runtime:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const theme = useExamStore((s) => s.theme);
  const isGreenTheme = theme === 'neon';
  const [loadError, setLoadError] = useState(false)
  const splineAppRef = useRef<Application | null>(null)

  // Capture asynchronous canvas loader exceptions (like the "Data read, but end of buffer not reached" runtime errors)
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event?.message || '';
      if (
        msg.includes('buffer') || 
        msg.includes('Spline') || 
        msg.includes('end of buffer') ||
        msg.includes('WebGL')
      ) {
        console.warn("[Spline Guard] Handled buffer loading crash globally:", msg);
        setLoadError(true);
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason?.message || String(event?.reason || '');
      if (
        reason.includes('buffer') || 
        reason.includes('Spline') || 
        reason.includes('end of buffer') ||
        reason.includes('WebGL')
      ) {
        console.warn("[Spline Guard] Handled asynchronous promise rejection:", reason);
        setLoadError(true);
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Enable global mouse tracking so the Spline robot follows the cursor
  // across the entire website, not just when hovering the 3D canvas
  const handleSplineLoad = useCallback((app: Application) => {
    splineAppRef.current = app;
    app.setGlobalEvents(true);
  }, []);

  const accent = isGreenTheme ? '#224334' : '#DC143C';
  const fallbackUI = (
    <div className={"w-full h-full flex flex-col items-center justify-center bg-radial p-6 text-center animate-fade-in " + (isGreenTheme ? "from-[#224334]/20 to-[#1A1814]" : "from-[#DC143C]/20 to-[#1A1814]")}>
      <div className={"w-24 h-24 rounded-full border animate-pulse flex items-center justify-center mb-4 bg-[#1A1814]/50 backdrop-blur-md shadow-lg " + (isGreenTheme ? "border-[#224334]/40 shadow-[#224334]/10" : "border-[#DC143C]/40 shadow-[#DC143C]/10")}>
        <svg className={"w-10 h-10 " + (isGreenTheme ? "text-[#224334]" : "text-[#DC143C]")} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-.11-8.157-.318z" />
        </svg>
      </div>
      <h3 className="font-serif text-base font-bold text-[#F2EFE7] tracking-wide">{isGreenTheme ? 'Forest Network: Classic 2D' : 'Crimson Network: Classic 2D'}</h3>
      <p className="text-xs font-sans text-[#F2EFE7]/70 italic max-w-xs mt-1 leading-relaxed">
        {isGreenTheme
          ? 'Tự động chuyển tiếp sang giao diện vườn cây nghệ thuật mượt mà để tiết kiệm hiệu năng pin & CPU.'
          : 'Tự động chuyển tiếp sang giao diện mạng lưới phấn vẽ Crimson nghệ thuật mượt mà để tiết kiệm hiệu năng pin & CPU.'}
      </p>
    </div>
  )

  if (loadError) {
    return fallbackUI;
  }

  return (
    <SafeErrorBoundary fallback={fallbackUI}>
      <div className="relative w-full h-full group">
        {/* Force Classic Mode Toggle Overlay to enhance usability on restricted browsers */}
        <button
          onClick={() => setLoadError(true)}
          className={"absolute top-3 right-3 z-30 bg-[#1A1814]/80 text-[#F2EFE7] px-2.5 py-1 text-[10px] uppercase font-serif font-bold tracking-widest rounded-lg border border-[#FAF9F6]/10 hover:border-transparent transition-all cursor-pointer opacity-40 hover:opacity-100 " + (isGreenTheme ? "hover:bg-[#224334]" : "hover:bg-[#DC143C]")}
          title="Tải nhẹ 2D mượt"
        >
          2D Classic Mode
        </button>

        <Suspense 
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-[#1A1814]/30">
              <div className={"w-8 h-8 border border-t-transparent rounded-full animate-spin " + (isGreenTheme ? "border-[#224334]" : "border-[#DC143C]")}></div>
            </div>
          }
        >
          <div className="w-full h-full">
            <Spline
              scene={scene}
              className={className}
              onLoad={handleSplineLoad}
              onError={() => {
                console.warn("[Spline Loader] OnError callback triggered.");
                setLoadError(true);
              }}
            />
          </div>
        </Suspense>
      </div>
    </SafeErrorBoundary>
  )
}

