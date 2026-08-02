import { ReactNode } from "react"

export function ShareViewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-0 py-0 sm:px-4 sm:py-6">
      <div className="w-full max-w-5xl">
        {children}
      </div>
    </div>
  )
}
