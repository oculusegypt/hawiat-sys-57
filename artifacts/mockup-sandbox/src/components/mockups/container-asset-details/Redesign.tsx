import {
  Box,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  MapPin,
  Navigation,
  UserRound,
} from "lucide-react";
import "./_group.css";

const details = [
  ["المعرّف الداخلي", "waste-asset-36-9"],
  ["نوع الحاوية المركزي", "حاوية نفايات صغيرة · #36"],
  ["التصنيف", "نفايات ومكابس"],
  ["وصف النوع", "حاويات النفايات والمكابس"],
  ["الحجم", "6 ياردة"],
  ["السعة", "6 م³"],
  ["الموقع الحالي", "مستودع الرياض"],
  ["آخر فحص", "2026-09-05"],
  ["سجل التخصيص", "—"],
  ["سجل العقد", "يوسف اليوسف"],
  ["سجل الموقع", "يوسف اليوسف — عنوان الطلب #68"],
];

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
      <p className="text-[10px] font-bold text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function RelationshipTile({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function Redesign() {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-2xl shadow-slate-200/70">
        <header className="bg-gradient-to-l from-slate-900 via-slate-900 to-cyan-950 px-5 py-6 text-white sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
                <Box size={14} />
                Asset operations / live profile
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight">حاوية WST-009</h1>
              <p className="mt-1 text-sm text-slate-300">بيانات التشغيل والمتابعة · آخر تحديث ٠٥‏/٠٩‏/٢٠٢٦، ٩:٥٣ ص</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/15 px-3 py-2 text-xs font-black text-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_0_4px_rgba(252,211,77,.15)]" />
              محجوزة
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3"><p className="text-[10px] font-bold text-slate-400">الموقع الحالي</p><p className="mt-1 truncate text-sm font-black">مستودع الرياض</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3"><p className="text-[10px] font-bold text-slate-400">آخر فحص</p><p className="mt-1 text-sm font-black">2026-09-05</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3"><p className="text-[10px] font-bold text-slate-400">العقود والتخصيصات</p><p className="mt-1 text-xl font-black text-cyan-300">2</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3"><p className="text-[10px] font-bold text-slate-400">الحركات التشغيلية</p><p className="mt-1 text-xl font-black text-cyan-300">0</p></div>
          </div>
        </header>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="grid gap-4 xl:grid-cols-[1.18fr_.82fr]">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700"><MapPin size={18} /></span>
                  <div><h2 className="text-sm font-black text-slate-900">موقع الحاوية عند العميل</h2><p className="mt-1 text-[11px] text-slate-500">الموقع المحدد في طلب التأجير والعقد المرتبط.</p></div>
                </div>
                <button type="button" className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-800"><ExternalLink size={13} /> فتح الخريطة</button>
              </div>
              <div className="p-4">
                <p className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800">رقم 299، الياسمين، بلدية الشمال <span className="font-normal text-slate-500">(إحداثيات GPS: 24.835898, 46.653941)</span></p>
                <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_45%_45%,#d9f99d_0_7%,transparent_8%),linear-gradient(135deg,#dbeafe_0_35%,#dcfce7_35%_66%,#fef3c7_66%)]">
                  <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(35deg,transparent_42%,#64748b_43%_44%,transparent_45%),linear-gradient(120deg,transparent_46%,#64748b_47%_48%,transparent_49%)]" />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-cyan-700 text-white shadow-xl shadow-cyan-900/30"><Navigation size={20} className="rotate-45" /></span>
                  <span className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-600">24.835898, 46.653941</span>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><UserRound size={18} /></span>
                <div><h2 className="text-sm font-black text-slate-900">العميل والتشغيل المرتبط</h2><p className="mt-1 text-[11px] text-slate-500">الجهات المرتبطة بهذا الأصل الآن.</p></div>
              </div>
              <div className="grid gap-2 p-4">
                <RelationshipTile label="العميل المستأجر" value="يوسف اليوسف" icon={<UserRound size={15} />} />
                <RelationshipTile label="العقد المرتبط" value="لا يوجد عقد مرتبط" icon={<FileText size={15} />} />
                <RelationshipTile label="موقع العميل" value="يوسف اليوسف — عنوان الطلب #68" icon={<MapPin size={15} />} />
                <RelationshipTile label="الطلب المرتبط" value="لا يوجد طلب مرتبط" icon={<ClipboardList size={15} />} />
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><ClipboardList size={18} /></span><div><h2 className="text-sm font-black text-slate-900">مواصفات الأصل وسجلّه</h2><p className="mt-1 text-[11px] text-slate-500">بيانات تعريفية موحدة بدون حقول مكررة أو تسميات عامة.</p></div></div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">11 بيانات</span>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">{details.map(([label, value]) => <DetailTile key={label} label={label} value={value} />)}</div>
            <div className="mx-4 mb-4 rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
              <div className="flex items-center gap-2 text-xs font-black text-cyan-900"><FileText size={14} /> وصف وتشغيل الأصل</div>
              <p className="mt-2 text-sm leading-7 text-slate-700">توفر حاوية النفايات الصغيرة حلاً مثالياً للشركات والمنشآت التجارية بالرياض، مع عقد سنوي مرن وتفريغ وصيانة دورية وضمان نظافة مستمرة.</p>
              <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-cyan-800">المخلفات البلدية والورقية</span><span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-cyan-800">مخلفات البلاستيك والطعام</span><span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-cyan-800">تفريغ دوري منتظم</span></div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-600" /> البيانات التشغيلية محدثة وقابلة للمراجعة</span>
            <span className="inline-flex items-center gap-2"><CalendarDays size={15} /> آخر فحص: 2026-09-05</span>
          </div>
        </div>
      </div>
    </main>
  );
}