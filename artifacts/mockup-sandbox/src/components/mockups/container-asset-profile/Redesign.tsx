import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  MapPin,
  Printer,
  RotateCcw,
  Trash2,
  Truck,
  UserRound,
  Wallet,
  Wrench,
} from "lucide-react";
import "./_group.css";

function Metric({ label, value, tone = "text-slate-900", icon }: { label: string; value: string; tone?: string; icon: ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold text-slate-400">{label}</p><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400">{icon}</span></div>
      <p className={`mt-3 text-xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function RelatedCard({ title, children, empty = false }: { title: string; children?: ReactNode; empty?: boolean }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-base font-black text-slate-900">{title}</h2>{!empty && <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-black text-cyan-800">مرتبط</span>}</div>
      {empty ? <p className="p-7 text-center text-sm text-slate-400">لا توجد سجلات مرتبطة</p> : children}
    </section>
  );
}

export function Redesign() {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-300/40">
          <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/10 p-3 sm:w-56"><div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600"><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-900/70 px-3 py-1 text-xs font-black tracking-widest text-white">WST-009</span></div></div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">Asset profile</span><span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-black text-amber-200">محجوزة</span></div>
                <h1 className="mt-3 text-3xl font-black tracking-tight" dir="ltr">WST-009</h1>
                <p className="mt-2 text-sm font-bold text-slate-300">حاوية نفايات صغيرة · 6 ياردة</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400"><span className="flex items-center gap-1.5"><MapPin size={13} className="text-cyan-300" /> مستودع الرياض</span><span className="flex items-center gap-1.5"><CalendarDays size={13} className="text-cyan-300" /> آخر تحديث ٠٥‏/٠٩‏/٢٠٢٦، ٩:٥٣ ص</span></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:flex-col"><button type="button" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white"><Printer size={15} /> طباعة الملف</button><button type="button" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black text-slate-300"><ArrowRight size={15} /> العودة</button></div>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="الحالة الحالية" value="محجوزة" tone="text-cyan-800" icon={<CheckCircle2 size={16} />} />
          <Metric label="الموقع الحالي" value="مستودع الرياض" icon={<MapPin size={16} />} />
          <Metric label="عدد الحركات" value="0" icon={<Truck size={16} />} />
          <Metric label="العقود المرتبطة" value="1" icon={<FileText size={16} />} />
          <Metric label="أوامر العمل" value="1" tone="text-amber-700" icon={<Wrench size={16} />} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="أيام التأجير المحسوبة" value="7" tone="text-indigo-700" icon={<CalendarDays size={16} />} />
          <Metric label="الاستفادة التقديرية" value="23%" tone="text-emerald-700" icon={<CheckCircle2 size={16} />} />
          <Metric label="الإيراد المرتبط" value="١٬٠٠٠ ر.س" tone="text-cyan-800" icon={<Wallet size={16} />} />
          <Metric label="التكلفة المرتبطة" value="٠ ر.س" tone="text-rose-700" icon={<Wallet size={16} />} />
          <Metric label="صافي القيمة" value="١٬٠٠٠ ر.س" tone="text-emerald-700" icon={<CheckCircle2 size={16} />} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="flex items-center gap-2 text-base font-black"><CalendarDays size={17} className="text-cyan-800" /> القصة التشغيلية للأصل</h2><p className="mt-1 text-xs text-slate-500">تسلسل زمني للحركات والعقود وأوامر التشغيل.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">2 أحداث</span></div>
            <div className="relative space-y-4 p-5 before:absolute before:bottom-8 before:right-[33px] before:top-8 before:w-px before:bg-slate-200">
              <div className="relative flex gap-3"><div className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-800"><CalendarDays size={16} /></div><div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-black">تسليم حاوية</p><time className="text-[11px] font-bold text-slate-400">٠٥‏/٠٩‏/٢٠٢٦، ١٠:٠٠ ص</time></div><p className="mt-1 text-xs text-slate-500">يوسف اليوسف · غير مسند</p></div></div>
              <div className="relative flex gap-3"><div className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800"><FileText size={16} /></div><div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-black">العقد —</p><time className="text-[11px] font-bold text-slate-400">٠٥‏/٠٩‏/٢٠٢٦، ٩:٥٣ ص</time></div><p className="mt-1 text-xs text-slate-500">active</p></div></div>
            </div>
          </section>

          <div className="space-y-5">
            <section className="overflow-hidden rounded-3xl border border-amber-200 bg-amber-50/70 shadow-sm"><div className="border-b border-amber-100 px-5 py-4"><h2 className="text-base font-black text-amber-950">إجراءات تشغيل سريعة</h2><p className="mt-1 text-xs text-amber-900/70">مرتبطة بالعقد والحاوية ولا تغيّر القيود المالية.</p></div><div className="flex flex-wrap gap-2 p-4"><button type="button" className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-3 py-2 text-xs font-black text-white"><RotateCcw size={14} /> استرجاع وسحب الحاوية</button><button type="button" className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-black text-amber-900"><Trash2 size={14} /> أمر تفريغ</button><span className="w-full text-xs font-semibold text-amber-800">أمر تشغيل قائم #723: غير مسند · غير مسند.</span></div></section>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="flex items-center gap-2 text-base font-black"><UserRound size={17} className="text-cyan-800" /> السياق المرتبط</h2></div><div className="grid gap-2 p-4"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-bold text-slate-400">العميل الحالي</p><p className="mt-1 text-sm font-black">يوسف اليوسف</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-bold text-slate-400">الموقع التشغيلي</p><p className="mt-1 text-sm font-black">مستودع الرياض</p></div></div></section>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <RelatedCard title="سجل الحركات" empty />
          <RelatedCard title="العقود المرتبطة"><div className="flex items-center gap-3 px-5 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800"><FileText size={16} /></span><div className="flex-1"><p className="text-sm font-black">يوسف اليوسف</p><p className="mt-1 text-[11px] text-slate-400">العقود · ٠٥‏/٠٩‏/٢٠٢٦، ٩:٥٣ ص</p></div><span className="text-xs font-black text-cyan-800">١٬٠٠٠ ر.س</span></div></RelatedCard>
          <RelatedCard title="أوامر العمل"><div className="flex items-center gap-3 px-5 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><Wrench size={16} /></span><div className="flex-1"><p className="text-sm font-black">إجراءات تشغيل سريعة</p><p className="mt-1 text-[11px] text-slate-400">work_order · ٠٥‏/٠٩‏/٢٠٢٦، ٩:٥٣ ص</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-800">new</span></div></RelatedCard>
          <RelatedCard title="الفحوصات والصيانة" empty />
        </div>
      </div>
    </main>
  );
}