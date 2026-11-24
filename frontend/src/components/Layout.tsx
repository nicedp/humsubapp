import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar />
        {/* pt-16 on mobile to clear the hamburger button; md:pt-6 restores normal spacing */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}