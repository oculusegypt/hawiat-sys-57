import React from "react"
import { Box, Truck, FileText, LayoutGrid } from "lucide-react"

export interface TabConfig {
  key: string
  label: string
  icon: any
  activeClass: string
}

export const TABS: TabConfig[] = [
  { key: "all",      label: "جميع الحاويات والمقاسات", icon: LayoutGrid, activeClass: "bg-slate-950 text-white shadow-xl shadow-slate-950/20 border-slate-950" },
  { key: "debris",   label: "حاويات الأنقاض والهدم (12-30 ياردة)", icon: Box, activeClass: "bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 border-amber-500" },
  { key: "waste",    label: "حاويات النفايات والمكابس", icon: Truck, activeClass: "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 border-emerald-600" },
  { key: "contract", label: "عقود النظافة ورخص بلدي", icon: FileText, activeClass: "bg-blue-600 text-white shadow-xl shadow-blue-600/20 border-blue-600" },
]

interface CategoryTabsProps {
  activeTab: string
  onSelectTab: (key: string) => void
}

export function CategoryTabs({ activeTab, onSelectTab }: CategoryTabsProps) {
  return (
    <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-4 mb-12 scrollbar-none px-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key
        const Icon = tab.icon
        return (
          <button
            key={tab.key}
            onClick={() => onSelectTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold border-2 transition-all duration-300 whitespace-nowrap shrink-0 transform active:scale-95 ${
              isActive
                ? `${tab.activeClass} scale-[1.02]`
                : `bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border-slate-200/80 shadow-sm hover:shadow`
            }`}
          >
            <Icon size={16} className={isActive ? "" : "text-amber-500"} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
