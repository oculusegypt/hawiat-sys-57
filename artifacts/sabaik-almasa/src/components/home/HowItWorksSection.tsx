import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Box,
  Truck,
  FileText,
  CalendarClock,
  Check,
  CheckCircle,
  Clock3,
  MapPin,
  Play,
  Zap,
} from "lucide-react"
import { useSiteSettings } from "@/context/SiteSettingsContext"

const serviceChoices = [
  {
    title: "حاويات الأنقاض",
    description: "لمخلفات البناء والهدم والترميم والرمل والبلوك",
    icon: Box,
  },
  {
    title: "حاويات النفايات",
    description: "للمطاعم والمنشآت والمجمعات التجارية والمكابس",
    icon: Truck,
  },
  {
    title: "عقود النظافة",
    description: "عقود معتمدة من أمانة الرياض لتجديد الرخص",
    icon: FileText,
  },
]

const containerChoices = ["12 ياردة", "15 ياردة", "20 ياردة", "30 ياردة"]
const timeChoices = ["طلب فوري · خلال ساعتين", "غدًا · 09:00 صباحًا", "حجز موعد مسبق"]

const demoStages = [
  {
    number: "01",
    title: "نوع الحاوية",
    description: "تبدأ باختيار فئة الحاوية المناسبة لنوع المخلفات.",
    icon: Box,
    focusLabel: "الخدمة",
    focusValue: "حاويات الأنقاض",
  },
  {
    number: "02",
    title: "حجم الحاوية",
    description: "تحدد المقاس المطلوب والموقع في أحياء الرياض.",
    icon: MapPin,
    focusLabel: "الحجم",
    focusValue: "20 ياردة",
  },
  {
    number: "03",
    title: "الموعد والتوصيل",
    description: "تختار التوصيل الفوري أو المجدول ويتواصل السائق لتأكيد الموقع.",
    icon: CalendarClock,
    focusLabel: "الموعد",
    focusValue: "طلب فوري · خلال ساعتين",
  },
  {
    number: "04",
    title: "تم إرسال الطلب",
    description: "تصل بيانات الحاوية لأسطولنا وتتحرك الشاحنة لموقعك فوراً.",
    icon: CheckCircle,
  },
] as const

const choiceListVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

const choiceItemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 340, damping: 24 },
  },
}

export function HowItWorksSection() {
  const { homepageContent } = useSiteSettings()
  const content = homepageContent.how
  const steps = demoStages
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (steps.length < 2) return
    const timer = window.setInterval(() => {
      setActiveStep(current => (current + 1) % steps.length)
    }, 3000)
    return () => window.clearInterval(timer)
  }, [steps.length])

  if (!content) return null

  const step = steps[Math.min(activeStep, steps.length - 1)]
  const activeService = serviceChoices[0]
  const StepIcon = step.icon

  return (
    <section id="how-it-works" className="home-section py-14 md:py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          {content.eyebrow && (
            <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Play size={11} className="fill-secondary" />
              {content.eyebrow}
            </span>
          )}
          {content.title && <h2 className="text-2xl md:text-4xl font-black text-primary mb-4">{content.title}</h2>}
          <div className="w-20 h-1.5 bg-secondary mx-auto rounded-full mb-4" />
          {content.description && <p className="text-gray-500 text-base md:text-lg leading-relaxed">{content.description}</p>}
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary bg-white border border-primary/10 rounded-full px-4 py-2 shadow-sm">
            <Clock3 size={16} className="text-secondary" />
            شاهد خطوات طلب وتوصيل الحاوية خلال أقل من دقيقة
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-1 md:gap-3 mb-5 md:mb-7">
            {steps.map((item, index) => (
              <motion.button
                type="button"
                key={`${item.number}-${index}`}
                onClick={() => setActiveStep(index)}
                aria-label={`عرض مرحلة ${item.title}`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className={`relative flex flex-col items-center text-center gap-2 cursor-pointer bg-transparent border-0 p-0 ${activeStep === index ? "text-primary" : "text-gray-400"}`}
              >
                {index < steps.length - 1 && (
                  <span className={`absolute top-4 right-1/2 w-full h-px ${activeStep > index ? "bg-secondary" : "bg-primary/10"}`} />
                )}
                <motion.span
                  animate={{
                    scale: activeStep === index ? 1.08 : 1,
                    boxShadow: activeStep === index ? "0 8px 20px rgba(18,56,75,.2)" : "0 0 0 rgba(0,0,0,0)",
                  }}
                  transition={{ type: "spring", stiffness: 360, damping: 24 }}
                  className={`relative z-10 flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border-2 text-[10px] md:text-xs font-black transition-colors ${
                  activeStep === index
                    ? "bg-primary border-primary text-white shadow-md"
                    : activeStep > index
                      ? "bg-secondary border-secondary text-white"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {activeStep > index ? <Check size={15} /> : item.number}
                </motion.span>
                <span className="text-[10px] md:text-xs font-black leading-tight">{item.title}</span>
              </motion.button>
            ))}
          </div>

          <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-secondary rounded-full"
              animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`demo-${activeStep}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
                className="how-preview bg-white border rounded-[1.75rem] shadow-xl p-5 md:p-8"
              >
                <div className="flex items-start justify-between gap-4 mb-7">
                  <div>
                    <span className="text-secondary text-xs font-black">{step.number} / {String(steps.length).padStart(2, "0")}</span>
                    <h3 className="text-xl md:text-2xl font-black text-primary mt-1">{step.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">{step.description}</p>
                  </div>
                  <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-secondary/10 text-secondary items-center justify-center shrink-0">
                    <StepIcon size={21} />
                  </div>
                </div>

                {activeStep === 0 && (
                  <motion.div
                    variants={choiceListVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                  >
                    {serviceChoices.map((service, index) => {
                      const ServiceIcon = service.icon
                      return (
                        <motion.div
                          key={service.title}
                          variants={choiceItemVariants}
                          whileHover={{ y: -5, scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          className={`text-right rounded-2xl border-2 p-4 ${index === 0 ? "border-secondary bg-secondary/10 shadow-md" : "border-gray-100 bg-white"}`}
                        >
                          <span className={`flex items-center justify-between mb-4 ${index === 0 ? "text-secondary" : "text-primary"}`}>
                            <span className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center">
                              <ServiceIcon size={18} />
                            </span>
                            {index === 0 && <CheckCircle size={17} />}
                          </span>
                          <span className="block font-black text-sm text-primary">{service.title}</span>
                          <span className="block text-xs text-gray-500 leading-relaxed mt-1">{service.description}</span>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-black text-primary mb-3">حجم الحاوية المطلوب</p>
                      <motion.div
                        variants={choiceListVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                      >
                        {containerChoices.map((choice, index) => (
                          <motion.div
                            key={choice}
                            variants={choiceItemVariants}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.97 }}
                            className={`px-3 py-2.5 rounded-xl border-2 text-sm font-bold text-center ${index === 2 ? "border-secondary bg-secondary/10 text-secondary" : "border-gray-100 text-gray-500"}`}
                          >
                            {choice}
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                    <div>
                      <span className="flex items-center gap-2 text-sm font-black text-primary mb-2">
                        <MapPin size={16} className="text-secondary" />
                        موقع المشروع / الحي
                      </span>
                      <div className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 flex items-center text-sm text-gray-600">
                        الرياض · حي الملقا
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm font-black text-primary">الموعد والتوصيل</p>
                    <motion.div
                      variants={choiceListVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                    >
                      {timeChoices.map((choice, index) => (
                        <motion.div
                          key={choice}
                          variants={choiceItemVariants}
                          whileHover={{ y: -3, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className={`rounded-xl border-2 p-3 text-right ${index === 0 ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100"}`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-black text-xs text-primary">{choice}</span>
                            {index === 0 && <CheckCircle size={16} className="text-secondary shrink-0" />}
                          </span>
                          <span className="block text-[11px] text-gray-500 mt-1">
                            {index === 0 ? "يتحرك أسطولنا لموقعك خلال ساعتين" : "مجدول حسب موعدك المفضل"}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}

                {activeStep >= 3 && (
                  <motion.div
                    variants={choiceListVariants}
                    initial="hidden"
                    animate="show"
                    className="rounded-2xl bg-primary/[0.04] border border-primary/10 p-4 md:p-5"
                  >
                    <motion.div variants={choiceItemVariants} className="flex items-center gap-3 mb-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -18 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.12 }}
                        className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center"
                      >
                        <Check size={20} />
                      </motion.div>
                      <div>
                        <p className="font-black text-primary">تم استلام وتأكيد طلب الحاوية</p>
                        <p className="text-xs text-gray-500">بيانات الطلب وصلت لغرفة العمليات الميدانية</p>
                      </div>
                    </motion.div>
                    <motion.div
                      variants={choiceItemVariants}
                      className="rounded-xl bg-white border border-secondary/20 px-4 py-3 mb-4 flex items-center justify-between gap-3"
                    >
                      <span className="text-xs text-gray-500">رقم الطلب</span>
                      <strong className="text-xl font-black text-secondary" dir="ltr">#1048</strong>
                    </motion.div>
                    <motion.div variants={choiceItemVariants} className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="block text-gray-400 text-xs mb-1">الخدمة</span><strong className="text-primary">{activeService.title}</strong></div>
                      <div><span className="block text-gray-400 text-xs mb-1">المقاس</span><strong className="text-primary">20 ياردة</strong></div>
                      <div><span className="block text-gray-400 text-xs mb-1">الموقع</span><strong className="text-primary">الرياض · حي الملقا</strong></div>
                      <div><span className="block text-gray-400 text-xs mb-1">الموعد</span><strong className="text-primary">طلب فوري</strong></div>
                    </motion.div>
                    <motion.div variants={choiceItemVariants} className="mt-4 rounded-xl bg-secondary/10 border border-secondary/20 px-3 py-2.5 text-xs font-bold text-primary flex items-center gap-2">
                      <CheckCircle size={15} className="text-secondary shrink-0" />
                      سيصلك إشعار واتساب بتفاصيل السائق ووقت الوصول
                    </motion.div>
                  </motion.div>
                )}

                <div className="flex items-center justify-center gap-2 mt-7 pt-5 border-t border-gray-100 text-sm font-bold text-secondary">
                  <Zap size={16} />
                  {activeStep === steps.length - 1 ? "اكتملت خطوات الطلب" : "ينتقل العرض التوضيحي تلقائيًا إلى الخطوة التالية"}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {content.footnote && <p className="text-center text-xs text-gray-400 mt-5">{content.footnote}</p>}
        </div>
      </div>
    </section>
  )
}