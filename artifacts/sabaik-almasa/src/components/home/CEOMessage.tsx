import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { useSiteSettings } from "@/context/SiteSettingsContext"

export function CEOMessage() {
  const { companyName, homepageContent } = useSiteSettings()
  const ceo = (homepageContent as any)?.ceo || (homepageContent?.sections as any)?.ceo || {}

  const title = typeof ceo.title === "string" ? ceo.title.trim() : ""
  const subtitle = typeof ceo.subtitle === "string" ? ceo.subtitle.trim() : ""
  const p1 = typeof ceo.message1 === "string" ? ceo.message1.trim() : ""
  const p2 = typeof ceo.message2 === "string" ? ceo.message2.trim() : ""
  const authorName = typeof ceo.authorName === "string" ? ceo.authorName.trim() : ""
  const authorTitle = typeof ceo.authorTitle === "string" ? ceo.authorTitle.trim() : ""
  const authorImage = typeof ceo.authorImage === "string" ? ceo.authorImage.trim() : ""
  if (![title, subtitle, p1, p2, authorName, authorTitle, authorImage].some(Boolean)) return null

  return (
    <section className="py-24 bg-primary text-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-4 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-64 h-64 md:w-80 md:h-80"
            >
              <div className="absolute inset-0 rounded-full border-2 border-secondary/30 scale-105 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border border-secondary scale-110"></div>
              {authorImage && (
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10 bg-white">
                  <img
                    src={authorImage}
                    alt={[authorName, authorTitle].filter(Boolean).join(" — ")}
                    className="w-full h-full object-cover object-[52%_center]"
                    width={320}
                    height={320}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Quote size={80} className="absolute -top-10 -right-8 text-white/10 transform rotate-180" />
              
              {title && <h2 className="text-2xl font-bold text-secondary mb-2">{title}</h2>}
              {subtitle && <h3 className="text-3xl font-bold mb-6">{subtitle}</h3>}
              
              <div className="space-y-4 text-lg text-gray-300 leading-relaxed italic mb-8 relative z-10">
                {p1 && <p>{p1}</p>}
                {p2 && <p>{p2}</p>}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-0.5 w-12 bg-secondary"></div>
                <div>
                    {authorName && <h4 className="font-bold text-xl text-white">{authorName}</h4>}
                    {authorTitle && <p className="text-secondary text-sm">{authorTitle}</p>}
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
