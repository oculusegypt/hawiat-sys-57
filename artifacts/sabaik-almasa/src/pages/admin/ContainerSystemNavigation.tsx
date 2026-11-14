import { useEffect, useMemo, useState } from "react"
import { Link } from "wouter"
import {
  Activity, AlertTriangle, Archive, ArrowDownLeft, ArrowLeftRight, ArrowUpLeft,
  ArrowUpRight, BarChart3, BellRing, BookOpenCheck, Box, CalendarDays, CarFront,
  CheckCircle2, ClipboardList, Coins, FileCheck2, FileText, Gauge, HandCoins,
  Landmark, LayoutDashboard, MapPinned, PackageCheck, ReceiptText, Search,
  Settings2, ShieldCheck, Truck, UserCog, UserRound, Users, WalletCards, Warehouse,
  Wrench,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { KIND_LABELS, type RecordKind } from "./ContainerSystemComponents"

export type ViewKey = RecordKind | "overview" | "financial_center" | "container_search" | "contracts_list" | "settlements" | "financial_cycle" | "identity_review" | "container_types" | "reports" | "audit" | "rental" | "vouchers" | "operations" | "customer_payments" | "bookings" | "expenses" | "payroll" | "fleet" | "warehouses" | "system_settings"

type NavItem = {
  key?: ViewKey
  href?: string
  action?: "new_contract"
  label: string
  icon: LucideIcon
  badge?: keyof WorkspaceAttention
}

type NavGroup = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  items: NavItem[]
}

export type WorkspaceAttention = {
  pendingContracts: number
  openOperations: number
  overdueInvoices: number
  maintenanceDue: number
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "command",
    label: "غرفة العمليات",
    description: "الصورة اليومية ومتابعة الأولويات",
    icon: LayoutDashboard,
    items: [
      { key: "overview", label: "مركز المتابعة", icon: Activity },
      { key: "alert", label: "التنبيهات اليومية", icon: BellRing },
      { key: "container_search", label: "البحث عن حاوية", icon: Search },
    ],
  },
  {
    id: "contracts",
    label: "العملاء والعقود",
    description: "من التحقق من العميل حتى إقفال العقد",
    icon: FileCheck2,
    items: [
      { key: "customer", label: "العملاء", icon: Users },
      { key: "identity_review", label: "مراجعة هويات العملاء", icon: ShieldCheck },
      { key: "customer_site", label: "مواقع العملاء", icon: MapPinned },
      { action: "new_contract", label: "إنشاء عقد", icon: FileCheck2 },
      { key: "contracts_list", label: "سجل العقود", icon: FileText, badge: "pendingContracts" },
      { key: "contract_line", label: "بنود الإيجار والتسعير", icon: ReceiptText },
    ],
  },
  {
    id: "field",
    label: "التشغيل الميداني",
    description: "الأصل والتخصيص والحركة حتى إتمام المهمة",
    icon: Truck,
    items: [
      { key: "container", label: "أصول الحاويات", icon: Box },
      { key: "container_types", label: "أنواع الحاويات", icon: PackageCheck },
      { key: "container_assignment", label: "تخصيص الحاويات", icon: ArrowLeftRight },
      { key: "operations", label: "سجل الحركات", icon: ArrowUpRight },
      { key: "bookings", label: "المواعيد والجدولة", icon: CalendarDays },
      { href: "/admin/container-map", label: "خريطة التشغيل", icon: MapPinned },
      { href: "/admin/work-orders", label: "أوامر العمل والسائقين", icon: ClipboardList, badge: "openOperations" },
    ],
  },
  {
    id: "finance",
    label: "المالية والتحصيل",
    description: "الفوترة والتحصيل والخزائن والإقفال",
    icon: WalletCards,
    items: [
      { key: "financial_center", label: "نظرة مالية شاملة", icon: WalletCards },
      { key: "invoice", label: "الفواتير", icon: FileText, badge: "overdueInvoices" },
      { key: "invoice_return", label: "مرتجعات الفواتير", icon: Archive },
      { key: "customer_payments", label: "سداد العملاء", icon: Coins },
      { key: "payment_return", label: "مرتجع التسديدات", icon: ArrowUpLeft },
      { key: "settlements", label: "كشف العقد والتسوية", icon: CheckCircle2 },
      { key: "receipt", label: "سندات القبض", icon: HandCoins },
      { key: "expense", label: "سندات الصرف", icon: ArrowDownLeft },
      { key: "other_revenue", label: "إيرادات أخرى", icon: Coins },
      { key: "deposit", label: "الإيداعات البنكية", icon: Landmark },
      { key: "bank_deposit", label: "مطابقة الإيداعات", icon: CheckCircle2 },
      { key: "treasury", label: "الخزائن", icon: Landmark },
      { key: "transfer", label: "التحويل بين الخزائن", icon: ArrowLeftRight },
      { key: "ledger_entry", label: "دفتر الأستاذ والمديونيات", icon: BookOpenCheck },
      { key: "financial_cycle", label: "الإقفال والمطابقة", icon: ClipboardList },
      { key: "daily_expense", label: "المصروفات اليومية", icon: ArrowDownLeft },
      { key: "fuel_expense", label: "مصروفات الوقود", icon: CarFront },
      { key: "salary_advance", label: "السلف", icon: Coins },
      { key: "salary_payment", label: "الرواتب", icon: Coins },
      { key: "commission", label: "العمولات", icon: Coins },
    ],
  },
  {
    id: "fleet",
    label: "الأسطول والصيانة",
    description: "جاهزية الشاحنات والسائقين والوثائق",
    icon: CarFront,
    items: [
      { key: "vehicle", label: "الشاحنات", icon: Truck },
      { key: "driver", label: "السائقون", icon: UserRound },
      { key: "maintenance", label: "الصيانة", icon: Wrench, badge: "maintenanceDue" },
      { key: "permit", label: "التصاريح والتجديدات", icon: FileCheck2 },
      { key: "oil_change", label: "الزيت والعدادات", icon: Gauge },
    ],
  },
  {
    id: "inventory",
    label: "المخزون والمستودعات",
    description: "الأصناف والمشتريات وحركات الصرف",
    icon: Warehouse,
    items: [
      { key: "warehouse", label: "المستودعات", icon: Warehouse },
      { key: "category", label: "الأصناف والتصنيفات", icon: PackageCheck },
      { key: "category_size", label: "أحجام الأصناف", icon: Box },
      { key: "purchase", label: "المشتريات", icon: ArrowDownLeft },
      { key: "purchase_return", label: "مرتجعات المشتريات", icon: Archive },
      { key: "stock_issue", label: "صرف المخزون", icon: ArrowUpRight },
      { key: "stock_issue_return", label: "مرتجع الصرف", icon: ArrowUpLeft },
    ],
  },
  {
    id: "people",
    label: "الموظفون والصلاحيات",
    description: "الفريق والأدوار والاعتمادات",
    icon: UserCog,
    items: [
      { key: "employee", label: "ملفات الموظفين", icon: Users },
      { href: "/admin/employees", label: "المستخدمون والصلاحيات", icon: UserCog },
    ],
  },
  {
    id: "control",
    label: "التقارير والحوكمة",
    description: "الرقابة وسجل التغييرات وتهيئة النظام",
    icon: BarChart3,
    items: [
      { key: "reports", label: "مركز التقارير", icon: BarChart3 },
      { key: "audit", label: "سجل التدقيق", icon: BookOpenCheck },
      { key: "notification", label: "الإشعارات", icon: BellRing },
      { key: "system_settings", label: "إعدادات المؤسسة والتشغيل", icon: Settings2 },
      { key: "branch", label: "الفروع", icon: Landmark },
      { key: "tax", label: "الضرائب", icon: Coins },
    ],
  },
]

export const viewLabel = (view: ViewKey) => {
  const item = NAV_GROUPS.flatMap(group => group.items).find(candidate => candidate.key === view)
  if (view === "overview") return "مركز المتابعة"
  if (view === "contracts_list") return "سجل العقود"
  if (view === "financial_center") return "نظرة مالية شاملة"
  if (view === "container_search") return "البحث عن حاوية"
  if (view === "container_types") return "أنواع الحاويات"
  if (view === "settlements") return "كشف العقد والتسوية"
  if (view === "financial_cycle") return "الإقفال والمطابقة"
  if (view === "identity_review") return "مراجعة هويات العملاء"
  if (view === "reports") return "مركز التقارير"
  if (view === "audit") return "سجل التدقيق"
  if (view === "rental") return "بنود الإيجار والتسعير"
  if (view === "vouchers") return "سندات القبض"
  if (view === "expenses") return "سندات الصرف"
  if (view === "payroll") return "الرواتب والسلف"
  if (view === "fleet") return "الشاحنات"
  if (view === "warehouses") return "المستودعات"
  if (view === "system_settings") return "إعدادات المؤسسة والتشغيل"
  if (view === "contract") return "إنشاء عقد"
  return item?.label ?? KIND_LABELS[view as RecordKind] ?? view
}

function itemValue(item: NavItem) {
  if (item.key) return `view:${item.key}`
  if (item.href) return `href:${item.href}`
  return `action:${item.action}`
}

export function ContainerSidebar({
  view,
  attention,
  attentionState,
  connectionState,
  onSelect,
  onNavigate,
  onCreateContract,
}: {
  view: ViewKey
  attention: WorkspaceAttention
  attentionState: "loading" | "ready" | "error"
  connectionState: "connecting" | "connected" | "disconnected"
  onSelect: (view: ViewKey) => void
  onNavigate: (href: string) => void
  onCreateContract: () => void
}) {
  const currentGroup = useMemo(
    () => NAV_GROUPS.find(group => group.items.some(item => item.key === view || (view === "contract" && item.action === "new_contract"))) ?? NAV_GROUPS[0],
    [view],
  )
  const [mobileGroup, setMobileGroup] = useState(currentGroup.id)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [currentGroup.id]: true })

  useEffect(() => {
    setMobileGroup(currentGroup.id)
    setExpanded(current => ({ ...current, [currentGroup.id]: true }))
  }, [currentGroup.id])

  const choose = (item: NavItem) => {
    if (item.key) onSelect(item.key)
    else if (item.href) onNavigate(item.href)
    else if (item.action === "new_contract") onCreateContract()
  }

  const attentionLinks = [
    { label: "عقود تحتاج مراجعة", count: attention.pendingContracts, onClick: () => onSelect("contracts_list") },
    { label: "مهام ميدانية مفتوحة", count: attention.openOperations, onClick: () => onNavigate("/admin/work-orders") },
    { label: "فواتير متأخرة", count: attention.overdueInvoices, onClick: () => onSelect("invoice") },
    { label: "صيانة مستحقة", count: attention.maintenanceDue, onClick: () => onSelect("maintenance") },
  ].filter(item => item.count > 0)

  const mobileItems = NAV_GROUPS.find(group => group.id === mobileGroup)?.items ?? currentGroup.items
  const selectedMobileItem = mobileItems.find(item => item.key === view || (view === "contract" && item.action === "new_contract")) ?? mobileItems[0]
  const connectionTone = connectionState === "connected"
    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
    : connectionState === "connecting"
      ? "border-amber-200/20 bg-amber-100/10 text-amber-100"
      : "border-rose-200/20 bg-rose-100/10 text-rose-100"
  const connectionDot = connectionState === "connected"
    ? "bg-emerald-300"
    : connectionState === "connecting"
      ? "bg-amber-300"
      : "bg-rose-300"
  const connectionLabel = connectionState === "connected"
    ? "متصل"
    : connectionState === "connecting"
      ? "جار الاتصال"
      : "غير متصل"

  return (
    <Card className="border-slate-200/80 bg-white shadow-[0_12px_32px_rgba(15,44,58,.06)] lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
      <CardContent className="p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-[#123d4e] px-3.5 py-3 text-white">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-cyan-200">مساحة العمل</p>
            <p className="mt-0.5 text-sm font-black">عمليات الحاويات</p>
          </div>
          <span className={"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold " + connectionTone}>
            <span className={"h-1.5 w-1.5 rounded-full " + connectionDot} /> {connectionLabel}
          </span>
        </div>

        <section className="mb-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3" aria-label="قائمة الأولويات">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-xs font-black text-slate-800">الأولويات الآن</h3>
            <span className="text-[10px] font-semibold text-slate-400">متابعة مباشرة</span>
          </div>
          {attentionState === "loading" ? (
            <p className="rounded-xl bg-white px-2.5 py-2 text-[11px] font-bold text-slate-500">جار تحميل الأولويات…</p>
          ) : attentionState === "error" ? (
            <p className="rounded-xl bg-rose-50 px-2.5 py-2 text-[11px] font-bold text-rose-800">تعذر تحديث الأولويات؛ أعد الاتصال ثم حدّث البيانات.</p>
          ) : attentionLinks.length === 0 ? (
            <p className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-[11px] font-bold text-emerald-800">
              <CheckCircle2 size={14} /> لا توجد عناصر حرجة حاليًا
            </p>
          ) : (
            <div className="space-y-1">
              {attentionLinks.map(item => (
                <button key={item.label} type="button" onClick={item.onClick} className="flex w-full items-center justify-between gap-2 rounded-xl bg-white px-2.5 py-2 text-right text-[11px] font-bold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-900">
                  <span className="flex min-w-0 items-center gap-2"><AlertTriangle size={13} className="shrink-0 text-amber-600" /><span className="truncate">{item.label}</span></span>
                  <span className="min-w-6 rounded-full bg-amber-100 px-1.5 py-0.5 text-center text-[10px] font-black text-amber-900">{item.count}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-2 sm:grid-cols-2 lg:hidden">
          <label className="text-[10px] font-bold text-slate-500">
            المجال
            <select aria-label="اختيار مجال النظام" value={mobileGroup} onChange={event => setMobileGroup(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-800">
              {NAV_GROUPS.map(group => <option key={group.id} value={group.id}>{group.label}</option>)}
            </select>
          </label>
          <label className="text-[10px] font-bold text-slate-500">
            القسم
            <select aria-label="اختيار قسم النظام" value={selectedMobileItem ? itemValue(selectedMobileItem) : ""} onChange={event => {
              const next = mobileItems.find(item => itemValue(item) === event.target.value)
              if (next) choose(next)
            }} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-800">
              {mobileItems.map(item => <option key={itemValue(item)} value={itemValue(item)}>{item.label}</option>)}
            </select>
          </label>
        </div>

        <nav className="hidden space-y-1.5 lg:block" aria-label="أقسام نظام الحاويات">
          {NAV_GROUPS.map(group => {
            const isOpen = Boolean(expanded[group.id])
            const hasActive = group.items.some(item => item.key === view || (view === "contract" && item.action === "new_contract"))
            const GroupIcon = group.icon
            return (
              <section key={group.id} className="rounded-2xl border border-transparent p-1 transition-colors hover:border-slate-100 hover:bg-slate-50/60">
                <button type="button" onClick={() => setExpanded(current => ({ ...current, [group.id]: !current[group.id] }))} aria-expanded={isOpen} className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-right transition ${hasActive ? "text-cyan-950" : "text-slate-600 hover:text-slate-900"}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${hasActive ? "bg-cyan-100 text-cyan-800" : "bg-slate-100 text-slate-500"}`}><GroupIcon size={16} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-xs font-black">{group.label}</span><span className="mt-0.5 block truncate text-[9px] font-medium text-slate-400">{group.description}</span></span>
                  <span className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}><span className="text-xs">⌄</span></span>
                </button>
                {isOpen && <div className="mt-1 space-y-0.5 border-r border-slate-200 pr-2">
                  {group.items.map(item => {
                    const Icon = item.icon
                    const active = item.key === view
                    const badge = item.badge ? attention[item.badge] : 0
                    const className = `flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-right text-xs font-bold transition ${active ? "bg-cyan-50 text-cyan-950 ring-1 ring-inset ring-cyan-100" : "text-slate-600 hover:bg-white hover:text-slate-950"}`
                    const content = <><Icon size={14} className={active ? "text-cyan-700" : "text-slate-400"} /><span className="min-w-0 flex-1 truncate">{item.label}</span>{badge > 0 && <span className="min-w-5 rounded-full bg-amber-100 px-1.5 py-0.5 text-center text-[10px] font-black text-amber-900">{badge}</span>}{active && <span className="h-1.5 w-1.5 rounded-full bg-cyan-600" />}</>
                    if (item.href) return <Link key={item.href} href={item.href} className={className}>{content}</Link>
                    return <button key={item.key ?? item.action} type="button" onClick={() => choose(item)} className={className}>{content}</button>
                  })}
                </div>}
              </section>
            )
          })}
        </nav>
      </CardContent>
    </Card>
  )
}
