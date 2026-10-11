import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle, ArrowLeftRight, Check, CheckCircle2, Clock3, Fingerprint,
  LoaderCircle, Mail, MapPin, Phone, RefreshCw, ShieldCheck, UserRound, X,
} from "lucide-react"
import {
  getGetContainerSystemRecordsQueryKey,
  getGetServiceRequestsQueryKey,
  useGetContainerSystemRecords,
  useGetServiceRequests,
  useResolveCustomerIdentityReview,
} from "@workspace/api-client-react"
import type { ContainerSystemRecord, ServiceRequest } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type ReviewAction = "approve" | "merge"
type RequestWithCustomer = ServiceRequest & { customerRecordId?: number | null }

function payloadText(record: ContainerSystemRecord, key: string, fallback = "غير متوفر") {
  const value = record.payload[key]
  return value === undefined || value === null || String(value).trim() === "" ? fallback : String(value)
}

function formatSubmittedAt(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return "وقت غير محدد"
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function RequestContext({ request }: { request: ServiceRequest }) {
  return (
    <div className="rounded-xl border border-[#d9e8e6] bg-[#f6faf9] p-3.5" data-testid={`request-context-${request.id}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full border border-[#c6ded9] bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-[#35645d]" dir="ltr">REQ-{request.id}</span>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500"><Clock3 size={12} />{formatSubmittedAt(request.createdAt)}</span>
      </div>
      <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
        <div><p className="text-[10px] font-bold text-slate-400">الاسم المرسل</p><p className="mt-0.5 text-sm font-bold text-slate-800">{request.clientName || "غير متوفر"}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400">رقم الهاتف</p><p className="mt-0.5 text-sm font-semibold text-slate-700" dir="ltr">{request.phone || "غير متوفر"}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400">البريد الإلكتروني</p><p className="mt-0.5 break-all text-xs text-slate-700" dir="ltr">{request.email || "غير متوفر"}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400">نوع الخدمة</p><p className="mt-0.5 text-sm font-semibold text-slate-700">{request.serviceType || "غير محدد"}</p></div>
        <div className="sm:col-span-2"><p className="text-[10px] font-bold text-slate-400">الموقع</p><p className="mt-0.5 text-sm leading-6 text-slate-700">{request.location || "غير متوفر"}</p></div>
      </div>
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className="space-y-3" aria-label="جارٍ تحميل مراجعات الهوية">
      {[0, 1, 2].map(item => <div key={item} className="animate-pulse rounded-2xl border border-[#dce9e7] bg-white p-5">
        <div className="h-5 w-40 rounded bg-[#e4eeec]" /><div className="mt-4 h-16 rounded-xl bg-[#f0f6f5]" /><div className="mt-3 h-12 rounded-xl bg-[#f0f6f5]" />
      </div>)}
    </div>
  )
}

export default function CustomerIdentityReview() {
  const queryClient = useQueryClient()
  const customerParams = { kind: "customer", status: "active" }
  const customerQuery = useGetContainerSystemRecords(customerParams, {
    query: { queryKey: getGetContainerSystemRecordsQueryKey(customerParams), staleTime: 30_000 },
  })
  const requestQuery = useGetServiceRequests(undefined, {
    query: { queryKey: getGetServiceRequestsQueryKey(), staleTime: 30_000 },
  })
  const resolveMutation = useResolveCustomerIdentityReview()
  const [activeRecord, setActiveRecord] = useState<ContainerSystemRecord | null>(null)
  const [action, setAction] = useState<ReviewAction>("approve")
  const [targetId, setTargetId] = useState("")
  const [reason, setReason] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [formError, setFormError] = useState("")
  const [mutationError, setMutationError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const customers = Array.isArray(customerQuery.data) ? customerQuery.data : []
  const requests = (Array.isArray(requestQuery.data) ? requestQuery.data : []) as RequestWithCustomer[]
  const pendingRecords = useMemo(() => customers.filter(record =>
    record.payload.identityReviewStatus === "pending" &&
    record.payload.identityVerification === "unverified",
  ), [customers])
  const verifiedCustomers = useMemo(() => customers.filter(record =>
    record.payload.identityVerification === "verified" &&
    record.payload.identityReviewStatus !== "pending",
  ), [customers])

  const linkedRequests = (record: ContainerSystemRecord) => {
    const payload = record.payload
    const ids = new Set([Number(payload.firstRequestId), Number(payload.lastRequestId)].filter(id => Number.isFinite(id) && id > 0))
    return requests.filter(request =>
      Number((request as RequestWithCustomer).customerRecordId ?? 0) === record.id || ids.has(request.id),
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const openReview = (record: ContainerSystemRecord, nextAction: ReviewAction) => {
    setActiveRecord(record)
    setAction(nextAction)
    setTargetId("")
    setReason("")
    setConfirmed(false)
    setFormError("")
    setMutationError("")
  }
  const closeReview = () => {
    if (resolveMutation.isPending) return
    setActiveRecord(null)
  }
  const submitReview = () => {
    if (!activeRecord) return
    if (reason.trim().length < 3) {
      setFormError("يرجى إدخال سبب واضح لا يقل عن 3 أحرف.")
      return
    }
    if (action === "merge" && !targetId) {
      setFormError("حدد ملف العميل الموثق الذي ستُنقل إليه الطلبات.")
      return
    }
    if (!confirmed) {
      setFormError(action === "approve" ? "أكد أنك تحققت من هوية العميل قبل الاعتماد." : "أكد مراجعة العميل المستهدف قبل تنفيذ الدمج.")
      return
    }
    setFormError("")
    setMutationError("")
    resolveMutation.mutate({
      id: activeRecord.id,
      data: {
        action,
        ...(action === "merge" ? { targetCustomerId: Number(targetId) } : {}),
        reason: reason.trim(),
      },
    }, {
      onSuccess: async result => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getGetContainerSystemRecordsQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getGetServiceRequestsQueryKey() }),
        ])
        setSuccessMessage(
          result.action === "approve"
            ? `تم اعتماد الهوية وتحديث ${result.updatedRequestCount} طلب.`
            : `تم دمج الملف وتحديث ${result.updatedRequestCount} طلب إلى العميل رقم ${result.mergedIntoCustomerId ?? targetId}.`,
        )
        setActiveRecord(null)
      },
      onError: () => setMutationError("تعذر حفظ قرار المراجعة. قد يكون السجل تغير منذ فتح الصفحة؛ حدّث البيانات ثم أعد المحاولة."),
    })
  }

  const isLoading = customerQuery.isLoading || requestQuery.isLoading
  const isError = customerQuery.isError || requestQuery.isError
  const isFetching = customerQuery.isFetching || requestQuery.isFetching

  return (
    <section className="space-y-5" dir="rtl">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[#c9dfdc] bg-[#eaf4f2] p-5 sm:p-6">
        <div className="absolute -left-8 -top-16 h-48 w-48 rounded-full border border-[#9fc9c2]/40" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#bfd9d5] bg-white/70 px-3 py-1 text-[11px] font-black text-[#35645d]"><Fingerprint size={14} /> مراجعة آمنة للهوية</div>
            <h2 className="text-xl font-black tracking-tight text-[#173f4c] sm:text-2xl">ملفات العملاء قيد التحقق</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#55716f]">قارن بيانات الملف مع طلبات الخدمة المرتبطة قبل الاعتماد أو الدمج. تطابق الهاتف وحده لا يكفي لإثبات الهوية.</p>
          </div>
          <Button variant="outline" onClick={() => { customerQuery.refetch(); requestQuery.refetch() }} className="h-10 shrink-0 gap-2 border-[#b9d3cf] bg-white/80 text-[#28564f] hover:bg-white" data-testid="button-refresh-identity-review">
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} /> تحديث البيانات
          </Button>
        </div>
        <div className="relative mt-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#58716f]">
          <span className="rounded-lg border border-[#c8ddda] bg-white/75 px-2.5 py-1.5">ملفات معلقة <strong className="mr-1 text-[#173f4c]">{isLoading ? "…" : pendingRecords.length}</strong></span>
          <span className="rounded-lg border border-[#c8ddda] bg-white/75 px-2.5 py-1.5">عملاء موثقون متاحون للدمج <strong className="mr-1 text-[#173f4c]">{verifiedCustomers.length}</strong></span>
          {(customerQuery.isStale || requestQuery.isStale) && <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-amber-800" role="status" data-testid="status-identity-stale"><AlertTriangle size={13} /> قد تكون البيانات قديمة؛ حدّث قبل اتخاذ القرار.</span>}
        </div>
      </div>

      {successMessage && <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800" role="status" data-testid="status-identity-success"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /><span>{successMessage}</span><button type="button" aria-label="إغلاق رسالة النجاح" onClick={() => setSuccessMessage("")} className="mr-auto text-emerald-700" data-testid="button-dismiss-identity-success"><X size={15} /></button></div>}

      {isLoading ? <ReviewSkeleton /> : isError ? (
        <Card className="border-rose-200 bg-rose-50/60">
          <CardContent className="flex flex-col items-center px-5 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700"><AlertTriangle size={22} /></div>
            <h3 className="font-black text-rose-900">تعذر تحميل بيانات المراجعة</h3>
            <p className="mt-1 max-w-md text-sm leading-6 text-rose-800">لم نتمكن من تحميل ملفات العملاء أو طلبات الخدمة المرتبطة. لم يُنفذ أي تغيير.</p>
            <Button variant="outline" onClick={() => { customerQuery.refetch(); requestQuery.refetch() }} className="mt-4 gap-2 border-rose-200 bg-white text-rose-800" data-testid="button-retry-identity-review"><RefreshCw size={14} /> إعادة المحاولة</Button>
          </CardContent>
        </Card>
      ) : pendingRecords.length === 0 ? (
        <Card className="border-[#d7e6e3] bg-white">
          <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#cde1dd] bg-[#edf6f4] text-[#44756d]"><ShieldCheck size={25} /></div>
            <h3 className="text-base font-black text-[#173f4c]">لا توجد هويات بانتظار المراجعة</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">ستظهر هنا الملفات المؤقتة غير الموثقة المرتبطة بطلبات العملاء عند وصولها.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingRecords.map(record => {
            const requestsForCustomer = linkedRequests(record)
            return <Card key={record.id} className="overflow-hidden border-[#d9e6e4] bg-white shadow-[0_8px_24px_rgba(24,65,74,.045)]" data-testid={`card-identity-review-${record.id}`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5f3] text-[#37675f]"><UserRound size={19} /></span>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-black text-[#173f4c]">{payloadText(record, "name", "اسم غير مسجل")}</h3>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-400" dir="ltr">{record.reference || `CUST-${record.id}`} · #{record.id}</p>
                      </div>
                      <span className="mr-auto inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800"><Clock3 size={12} /> بانتظار التحقق</span>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-100 bg-[#fbfcfc] p-3"><p className="text-[10px] font-bold text-slate-400">الهاتف في الملف</p><p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700" dir="ltr"><Phone size={13} className="text-slate-400" />{payloadText(record, "phone")}</p></div>
                      <div className="rounded-xl border border-slate-100 bg-[#fbfcfc] p-3"><p className="text-[10px] font-bold text-slate-400">البريد في الملف</p><p className="mt-1 flex items-center gap-1.5 break-all text-xs font-semibold text-slate-700" dir="ltr"><Mail size={13} className="shrink-0 text-slate-400" />{payloadText(record, "email")}</p></div>
                      <div className="rounded-xl border border-slate-100 bg-[#fbfcfc] p-3"><p className="text-[10px] font-bold text-slate-400">إنشاء الملف</p><p className="mt-1 text-xs font-semibold text-slate-700">{formatSubmittedAt(record.createdAt)}</p></div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:w-52 xl:flex-col">
                    <Button onClick={() => openReview(record, "approve")} className="h-10 flex-1 gap-2 bg-[#245d55] text-white hover:bg-[#1c4e47]" data-testid={`button-approve-identity-${record.id}`}><Check size={15} /> اعتماد بعد التحقق</Button>
                    <Button variant="outline" onClick={() => openReview(record, "merge")} className="h-10 flex-1 gap-2 border-[#c8dcd8] bg-white text-[#28564f] hover:bg-[#f2f8f6]" data-testid={`button-merge-identity-${record.id}`}><ArrowLeftRight size={15} /> دمج في عميل موثق</Button>
                  </div>
                </div>
                <div className="mt-4 border-t border-[#edf2f1] pt-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-[#365b5d]">سياق طلبات الخدمة المرتبطة</h4>
                    <span className="text-[10px] font-semibold text-slate-400">{requestsForCustomer.length} طلب</span>
                  </div>
                  {requestsForCustomer.length ? <div className="grid gap-2 lg:grid-cols-2">{requestsForCustomer.map(request => <RequestContext key={request.id} request={request} />)}</div> :
                    <div className="flex items-start gap-2 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-3.5 py-3 text-xs leading-5 text-amber-900"><MapPin size={14} className="mt-0.5 shrink-0" />لا يوجد طلب خدمة مرتبط متاح للمقارنة. راجع التفاصيل خارج هذه الشاشة قبل اعتماد الهوية؛ لا تعتمد على رقم الهاتف وحده.</div>}
                </div>
              </CardContent>
            </Card>
          })}
        </div>
      )}

      <Dialog open={Boolean(activeRecord)} onOpenChange={open => { if (!open) closeReview() }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#173f4c]">{action === "approve" ? <ShieldCheck size={20} className="text-[#39736a]" /> : <ArrowLeftRight size={19} className="text-[#39736a]" />}{action === "approve" ? "تأكيد اعتماد الهوية" : "تأكيد دمج ملف العميل"}</DialogTitle>
            <DialogDescription className="leading-6">
              {action === "approve"
                ? "لن يتم اعتماد الملف إلا بعد تأكيد مراجعة الهوية وتوثيق سبب القرار في سجل التدقيق."
                : "اختر عميلاً نشطاً وموثقاً كوجهة. ستُنقل الطلبات المرتبطة وفقاً لنتيجة الدمج، ويُحفظ السبب للتدقيق."}
            </DialogDescription>
          </DialogHeader>
          {activeRecord && <div className="space-y-4 py-1">
            <div className="rounded-xl border border-[#d9e8e6] bg-[#f6faf9] p-3">
              <p className="text-[10px] font-bold text-slate-400">الملف المؤقت قيد المراجعة</p>
              <p className="mt-1 font-black text-[#173f4c]">{payloadText(activeRecord, "name", "اسم غير مسجل")}</p>
              <p className="mt-1 text-xs text-slate-500" dir="ltr">{payloadText(activeRecord, "phone")}</p>
            </div>
            {action === "merge" && <div>
              <label htmlFor="identity-target" className="mb-1.5 block text-xs font-black text-slate-700">العميل النشط والموثق المستهدف <span className="text-rose-600">*</span></label>
              <select id="identity-target" value={targetId} onChange={event => setTargetId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#5b8e85] focus:ring-2 focus:ring-[#5b8e85]/15" data-testid="select-identity-merge-target">
                <option value="">اختر ملفاً موثقاً</option>
                {verifiedCustomers.filter(item => item.id !== activeRecord.id).map(customer => <option key={customer.id} value={customer.id}>{payloadText(customer, "name", `عميل رقم ${customer.id}`)} · {payloadText(customer, "phone", "دون هاتف")} · #{customer.id}</option>)}
              </select>
              {verifiedCustomers.length === 0 && <p className="mt-1.5 text-xs text-amber-800">لا يوجد حالياً عميل نشط موثق متاح للدمج.</p>}
            </div>}
            <div>
              <label htmlFor="identity-reason" className="mb-1.5 block text-xs font-black text-slate-700">سبب القرار للتدقيق <span className="text-rose-600">*</span></label>
              <Textarea id="identity-reason" value={reason} onChange={event => setReason(event.target.value)} placeholder={action === "approve" ? "اذكر كيف تم التحقق من الهوية..." : "اذكر سبب اختيار ملف العميل المستهدف..."} rows={3} className="resize-y rounded-xl border-slate-200 text-sm" data-testid="textarea-identity-review-reason" />
              <p className="mt-1 text-[10px] text-slate-400">ثلاثة أحرف على الأقل. سيُحفظ النص مع قرار المراجعة.</p>
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#dce8e6] bg-[#fbfdfc] p-3 text-xs leading-5 text-slate-700">
              <input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-1 h-4 w-4 accent-[#245d55]" data-testid="checkbox-confirm-identity-review" />
              <span>{action === "approve" ? "أؤكد أنني راجعت المعلومات المتاحة وتحققت من هوية العميل قبل الاعتماد." : "أؤكد أنني راجعت ملف العميل الموثق المستهدف وسبب الدمج قبل التنفيذ."}</span>
            </label>
            {formError && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900" role="alert" data-testid="text-identity-form-error">{formError}</p>}
            {mutationError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold leading-5 text-rose-800" role="alert" data-testid="text-identity-mutation-error">{mutationError}</p>}
          </div>}
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="button" variant="outline" onClick={closeReview} disabled={resolveMutation.isPending} data-testid="button-cancel-identity-review">إلغاء</Button>
            <Button type="button" onClick={submitReview} disabled={resolveMutation.isPending || (action === "merge" && verifiedCustomers.length === 0)} className={action === "approve" ? "gap-2 bg-[#245d55] text-white hover:bg-[#1c4e47]" : "gap-2 bg-[#28516a] text-white hover:bg-[#203f53]"} data-testid="button-confirm-identity-review">
              {resolveMutation.isPending ? <><LoaderCircle size={15} className="animate-spin" /> جارٍ حفظ القرار</> : <><Check size={15} /> تأكيد {action === "approve" ? "الاعتماد" : "الدمج"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
