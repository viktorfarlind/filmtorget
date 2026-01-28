'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Ticket, Film, Disc } from 'lucide-react'

export default function HeroSection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentFormat = searchParams.get('format')
  const currentSearch = searchParams.get('q') || ''

  const [searchTerm, setSearchTerm] = useState(currentSearch)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set('q', searchTerm)
    } else {
      params.delete('q')
    }
    router.push(`/?${params.toString()}`)
  }

  const handleFilter = (format: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (format === 'Alla') {
      params.delete('format')
    } else {
      params.set('format', format)
    }
    router.push(`/?${params.toString()}`)
  }

  const filters = [
    { label: 'Alla', icon: Film },
    { label: '4K UHD', icon: Disc },
    { label: 'Blu-ray', icon: Disc },
    { label: 'DVD', icon: Disc },
    { label: 'VHS', icon: Ticket },
  ]

  return (

    <div className="bg-slate-950 text-white pb-12 pt-8 px-4 rounded-b-4xl shadow-2xl relative overflow-hidden border-b border-slate-800">
      
      <div className="absolute top-[-20%] left-[20%] w-100 h-100 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-75 h-75 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
        
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Filmtorget
          </h1>
          <p className="text-slate-400 text-lg font-light">
            Sveriges marknadsplats för filmnördar.
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="relative max-w-lg mx-auto group">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Sök titel, regissör..." 
              autoComplete="off"
              className="w-full py-4 pl-14 pr-6 rounded-full bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-900 transition-all font-medium shadow-lg appearance-none"
            />
            <Search className="absolute left-5 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" strokeWidth={2} />
            
            {searchTerm && (
              <button type="submit" className="absolute right-2 bg-blue-600 hover:bg-blue-500 p-2 rounded-full transition-colors">
                <Ticket className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {filters.map((f) => {
            const isActive = currentFormat === f.label || (f.label === 'Alla' && !currentFormat)
            const Icon = f.icon
            
            return (
              <button 
                key={f.label}
                onClick={() => handleFilter(f.label)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border
                  ${isActive 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50 scale-105' 
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                  }
                `}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} strokeWidth={2} />
                {f.label}
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}