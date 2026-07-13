'use client';

import {
  Bell,
  CalendarDays,
  GraduationCap,
  UserCircle
} from 'lucide-react';

export default function Header() {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 lg:px-10 h-20">

        {/* Left Section */}
        <div className="flex items-center gap-5">

          {/* Logo */}
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#F7941D] shadow-md">
            <GraduationCap
              size={28}
              className="text-white"
              strokeWidth={2.2}
            />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">
              LPU Sustainability Auditor
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              AI Powered Sustainability Analytics Dashboard
            </p>
          </div>

        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">

          {/* Date */}
          <div className="hidden lg:flex items-center gap-2 text-gray-500 text-sm">
            <CalendarDays size={18} />
            <span>{today}</span>
          </div>

          {/* Notification */}
          <button
            className="
            relative
            flex
            items-center
            justify-center
            w-11
            h-11
            rounded-full
            bg-gray-100
            hover:bg-orange-100
            transition-all
            duration-200
            "
          >
            <Bell
              size={20}
              className="text-gray-600"
            />

            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#F7941D]" />
          </button>

          {/* Faculty Card */}
          <div
            className="
            flex
            items-center
            gap-3
            px-4
            py-2
            rounded-xl
            border
            border-gray-200
            bg-white
            shadow-sm
            "
          >

            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#F7941D]">
              <UserCircle
                className="text-white"
                size={26}
              />
            </div>

            <div className="hidden sm:block">

              <p className="text-sm font-semibold text-gray-800">
                Faculty Dashboard
              </p>

              <p className="text-xs text-gray-500">
                Lovely Professional University
              </p>

            </div>

          </div>

        </div>

      </div>
    </header>
  );
}
