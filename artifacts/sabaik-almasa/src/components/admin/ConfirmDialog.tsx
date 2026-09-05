import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const finish = useCallback((value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setRequest(null)
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    if (resolver.current) resolver.current(false)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
      setRequest(options)
    })
  }, [])

  useEffect(() => () => finish(false), [finish])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={Boolean(request)} onOpenChange={(open) => !open && finish(false)}>
        <AlertDialogContent dir="rtl" className="max-w-md rounded-3xl border-0 p-0 overflow-hidden">
          <div className={`h-1.5 ${request?.destructive === false ? "bg-primary" : "bg-destructive"}`} />
          <div className="p-6">
            <AlertDialogHeader className="text-right sm:text-right">
              <div className="mb-3 flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${request?.destructive === false ? "bg-primary/10 text-primary" : "bg-red-50 text-red-600"}`}>
                  <AlertTriangle size={21} />
                </span>
                <AlertDialogTitle className="text-lg font-extrabold text-slate-900">
                  {request?.title ?? "تأكيد العملية"}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-sm leading-7 text-slate-500">
                {request?.description ?? "هل تريد المتابعة؟ لا يمكن التراجع عن هذا الإجراء بسهولة."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-2 sm:flex-row-reverse sm:justify-start">
              <AlertDialogAction
                onClick={() => finish(true)}
                className={request?.destructive === false ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-red-600 text-white hover:bg-red-700"}
              >
                {request?.confirmLabel ?? "متابعة"}
              </AlertDialogAction>
              <AlertDialogCancel onClick={() => finish(false)} className="mt-0">
                {request?.cancelLabel ?? "إلغاء"}
              </AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error("useConfirm must be used inside ConfirmProvider")
  return context
}