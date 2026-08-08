import { ReactNode } from "react"

export function ShareViewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col px-0 py-0 sm:px-4 sm:py-6">
      <div className="m-auto w-full max-w-[800px]">
        {children}
      </div>
    </div>
  )
}
