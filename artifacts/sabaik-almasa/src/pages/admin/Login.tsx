import { useState } from "react"
import { useLocation } from "wouter"
import { useAdminLogin } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, User } from "lucide-react"
import { useSiteSettings } from "@/context/SiteSettingsContext"

export default function AdminLogin() {
  const { companyName, logoUrl, isLoaded } = useSiteSettings()
  const [, setLocation] = useLocation()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  
  const { mutate: login, isPending } = useAdminLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    login({ data: { username, password } }, {
      onSuccess: (res) => {
        if (!res?.token) {
          setError("خطأ في الخادم — لم يتم استلام رمز الجلسة")
          return
        }
        localStorage.setItem("admin_token", res.token)
        localStorage.setItem("admin_role", res.user.role)
        localStorage.setItem("admin_id", String(res.user.id))
        localStorage.setItem("admin_name", res.user.name)
        localStorage.setItem("admin_permissions", JSON.stringify(res.user.permissions ?? []))
        setLocation(res.user.role === "driver" ? "/admin/work-orders" : "/admin")
      },
      onError: (err: any) => {
        const status = err?.response?.status ?? err?.status
        if (status === 401 || status === 403) {
          setError("بيانات الدخول غير صحيحة")
        } else if (status === 400) {
          setError("يرجى إدخال اسم المستخدم وكلمة المرور")
        } else if (!navigator.onLine) {
          setError("لا يوجد اتصال بالإنترنت")
        } else {
          setError(`تعذّر الاتصال بالخادم (${status ?? "خطأ شبكة"})`)
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-repeat"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-8">
           {isLoaded && logoUrl ? <img src={logoUrl} alt={`شعار ${companyName}`} className="h-16 mx-auto mb-4 object-contain" /> : <div className="h-16 mb-4" aria-hidden="true" />}
          <h1 className="text-2xl font-bold text-gray-900">تسجيل الدخول للإدارة</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                required 
                  autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-3 pr-10 text-left"
                dir="ltr"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                type="password"
                required 
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-3 pr-10 text-left"
                dir="ltr"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg mt-6 bg-secondary hover:bg-secondary/90 text-white"
            disabled={isPending}
          >
            {isPending ? "جاري التحقق..." : "تسجيل الدخول"}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-xs text-gray-500">
          <p className="font-semibold text-gray-700 mb-2">بيانات دخول المسؤول التجريبية:</p>
          <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <div className="space-y-0.5">
              <p><span className="text-gray-400">المستخدم:</span> <code className="font-mono text-gray-900 font-bold">admin</code></p>
              <p><span className="text-gray-400">كلمة المرور:</span> <code className="font-mono text-gray-900 font-bold">admin123</code></p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername("admin");
                setPassword("admin123");
              }}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded text-xs transition"
            >
              تعبئة تلقائية
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
