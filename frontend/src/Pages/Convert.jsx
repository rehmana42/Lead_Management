import { RefreshCcw } from 'lucide-react';
import React, { useState } from 'react'

import {
  Search,
  MapPin,
  Globe,
  Phone,
  Star,
  Bell,
  Trash2,
  ExternalLink,
  RefreshCw,
  X,
  Building2,
  Filter,
  ChevronDown,
  Download,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
const Convert = () => {
      const [loading, setLoading] = useState(false);
       const [leads, setLeads] = useState([]);
         // ================= HELPERS =================

  const cleanAddress = (address) => {
    return address
      ? String(address).replace("", "").trim()
      : "Address unavailable";
  };

  const formatDate = (date) => {
    if (!date) return "Not set";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "Not set"
      : parsed.toLocaleString("en-IN");
  };




return (
  <section className="w-full min-w-0 space-y-5 pb-5">

    {/* ================= PAGE HEADER ================= */}

    <div className="overflow-hidden rounded-xl border border-[#d5d0c3] bg-[#faf9f5] shadow-[3px_4px_10px_rgba(0,0,0,0.06)]">

      <div className="flex flex-col gap-5 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

        {/* HEADING */}

        <div className="flex min-w-0 items-start gap-3 sm:gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#d8c47a] bg-[#fff4b8] shadow-[2px_3px_0px_#d8c47a] sm:h-14 sm:w-14">
            <Building2 size={24} className="text-neutral-900" />
          </div>

          <div className="min-w-0">

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-neutral-900 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white">
                Lead Management
              </span>

        
            </div>

            <h1 className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl lg:text-[28px]">
              Converted Leads
            </h1>

            <p className="mt-1 max-w-xl text-xs leading-5 text-neutral-500 sm:text-sm">
              View business details, manage follow-ups and track your
              lead conversions from one place.
            </p>

          </div>
        </div>

        {/* TOTAL COUNT */}

        <div className="flex shrink-0 items-center justify-between gap-5 rounded-xl border border-[#d8c47a] bg-[#fff4b8] px-5 py-3.5 shadow-[2px_3px_0px_#d8c47a] lg:min-w-[170px]">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              Total Leads
            </p>

            <p className="mt-1 text-2xl font-black tabular-nums text-neutral-900">
              {leads.length}
            </p>
          </div>

          <Building2 size={25} className="text-neutral-700" />

        </div>

      </div>

      {/* HEADER BOTTOM STRIP */}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#d5d0c3] bg-[#f0eee7] px-4 py-2.5 sm:px-6">

        <p className="text-[10px] font-medium text-neutral-500 sm:text-xs">
          Manage and organize your business prospects
        </p>

        <span className="rounded-md border border-[#d5d0c3] bg-[#faf9f5] px-2.5 py-1 text-[10px] font-semibold text-neutral-600">
          {loading ? "Loading..." : "Ready"}
        </span>

      </div>

    </div>

    {/* ================= BUSINESS TABLE SECTION ================= */}

    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[#d5d0c3] bg-[#faf9f5] shadow-[3px_4px_10px_rgba(0,0,0,0.06)]">

      {/* TABLE SECTION HEADING */}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d5d0c3] bg-[#faf9f5] px-4 py-4 sm:px-5">

        <div>
          <h2 className="text-sm font-extrabold text-neutral-900 sm:text-base">
            All Businesses
          </h2>

          <p className="mt-1 text-[11px] text-neutral-500">
            Complete list of your business leads
          </p>
        </div>

        <span className="rounded-lg border border-[#d8c47a] bg-[#fff4b8] px-3 py-2 text-[11px] font-bold text-neutral-800">
          {leads.length} Records
        </span>

      </div>

      {/* ================= CONTENT ================= */}

      {loading ? (

        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-6 text-center">

          <RefreshCcw
            size={25}
            className="animate-spin text-neutral-700"
          />

          <p className="text-sm text-neutral-500">
            Loading businesses...
          </p>

        </div>

      ) : leads.length === 0 ? (

        <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#d8c47a] bg-[#fff4b8]">
            <Building2 size={23} />
          </div>

          <h3 className="text-base font-bold">
            No businesses found
          </h3>

          <p className="mt-2 max-w-xs text-sm text-neutral-500">
            Try changing your search or filters.
          </p>


        </div>

      ) : (

        <>

          {/* ================= MOBILE / TABLET CARDS ================= */}

          <div className="grid grid-cols-1 gap-3 bg-[#eeece5] p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 lg:hidden">

            {leads.map((lead, index) => (

              <article
                key={lead._id || index}
                className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#d5d0c3] bg-[#faf9f5] p-4 shadow-[inset_2px_2px_2px_#ffffff,3px_5px_9px_rgba(0,0,0,0.08)] sm:p-5"
              >

                {/* CARD HEADER */}

                <div className="flex min-w-0 items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#d8c47a] bg-[#fff4b8]">
                    <Building2 size={19} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="break-words text-sm font-bold leading-5">
                      {lead.name || `Business ${index + 1}`}
                    </h3>

                    <p className="mt-1 break-all text-[10px] text-neutral-400">
                      #{index + 1} · {lead._id}
                    </p>

                  </div>

                  {lead.rating && (

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#d8c47a] bg-[#fff4b8] px-2 py-1.5 text-xs font-bold">

                      <Star
                        size={12}
                        className="fill-[#c5a21a] text-[#c5a21a]"
                      />

                      {String(lead.rating)
                        .replace(/stars?/i, "")
                        .trim()}

                    </span>

                  )}

                </div>

                {/* CARD INFORMATION */}

                <div className="mt-4 flex-1 space-y-3 rounded-lg border border-[#e0dcd1] bg-[#eeece5] p-3 shadow-inner">

                  {/* PHONE */}

                  <div className="flex min-w-0 items-start gap-3">

                    <Phone
                      size={15}
                      className="mt-0.5 shrink-0 text-neutral-500"
                    />

                    {lead.phone ? (

                      <a
                        href={`tel:${lead.phone}`}
                        className="min-w-0 break-all text-xs font-semibold hover:underline"
                      >
                        {lead.phone}
                      </a>

                    ) : (

                      <span className="text-xs text-neutral-400">
                        Phone unavailable
                      </span>

                    )}

                  </div>

                  {/* ADDRESS */}

                  <div className="flex min-w-0 items-start gap-3">

                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 text-neutral-500"
                    />

                    <p className="min-w-0 break-words text-xs leading-5 text-neutral-600">
                      {cleanAddress(lead.address)}
                    </p>

                  </div>

                  {/* REMINDER */}

                  <div className="flex min-w-0 items-start gap-3">

                    <Bell
                      size={15}
                      className="mt-0.5 shrink-0 text-neutral-500"
                    />

                    <p className="min-w-0 break-words text-xs leading-5 text-neutral-600">

                      {lead.reminder
                        ? formatDate(lead.reminder)
                        : "Reminder not set"}

                    </p>

                  </div>

                </div>

                {/* MOBILE LINKS */}

                <div className="mt-4 flex flex-wrap items-center gap-2">

                  {lead.website ? (

                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btn} min-h-9 gap-2 px-3 text-xs`}
                    >
                      <Globe size={13} />
                      Website
                      <ExternalLink size={11} />
                    </a>

                  ) : (

                    <span className="inline-flex min-h-9 items-center rounded-lg border border-[#e0dcd1] bg-[#eeece5] px-3 text-xs text-red-500">
                      No Website
                    </span>

                  )}

                  {lead.mapsUrl && (

                    <a
                      href={lead.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btn} min-h-9 gap-2 px-3 text-xs`}
                    >
                      <MapPin size={13} />
                      Maps
                      <ExternalLink size={11} />
                    </a>

                  )}

                </div>

                {/* MOBILE ACTIONS */}

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#d5d0c3] pt-4">

                  <button
                    type="button"
                    onClick={() => openReminder(lead)}
                    className={`${yellowBtn} min-h-10 w-full gap-2 px-2 text-xs`}
                  >
                    <Bell size={14} />
                    Reminder
                  </button>

                  <button
                    type="button"
                    onClick={() => setConverted(lead._id)}
                    className={`${btn} min-h-10 w-full gap-2 px-2 text-xs text-green-700 hover:bg-green-50`}
                  >
                    <CheckCircle2 size={14} />
                    Converted
                  </button>

                  <button
                    type="button"
                    onClick={() => notIntrested(lead._id)}
                    className={`${btn} col-span-2 min-h-10 w-full gap-2 px-3 text-xs text-red-600 hover:bg-red-50`}
                  >
                    <Trash2 size={14} />
                    Not Interested
                  </button>

                </div>

              </article>

            ))}

          </div>

          {/* ================= DESKTOP TABLE ================= */}

          <div className="hidden w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain lg:block">

            <table className="w-full min-w-[1200px] table-fixed border-collapse text-left">

              <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>

              {/* TABLE HEADER */}

              <thead className="bg-neutral-950 text-white">

                <tr>

                  {[
                    "#",
                    "Business",
                    "Phone",
                    "Rating",
                    "Address",
                    "Reminder",
                    "Links",
                    "Actions",
                  ].map((heading) => (

                    <th
                      key={heading}
                      scope="col"
                      className={`${thStyle} px-3 py-4 text-[11px] font-bold uppercase tracking-wide`}
                    >
                      {heading}
                    </th>

                  ))}

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody className="divide-y divide-[#d5d0c3] bg-[#faf9f5]">

                {filteredLeads.map((lead, index) => (

                  <tr
                    key={lead._id || index}
                    className="align-top transition-colors hover:bg-[#fffdf1]"
                  >

                    {/* NUMBER */}

                    <td className={`${tdStyle} px-3 py-4`}>

                      <span className="inline-flex min-w-8 items-center justify-center rounded-md border border-[#d5d0c3] bg-[#eeece5] px-2 py-1.5 text-xs font-bold text-neutral-500 shadow-inner">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                    </td>

                    {/* BUSINESS */}

                    <td className={`${tdStyle} px-3 py-4`}>

                      <div className="flex min-w-0 items-start gap-2">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d8c47a] bg-[#fff4b8]">
                          <Building2 size={16} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="break-words text-xs font-bold leading-5">
                            {lead.name || `Business ${index + 1}`}
                          </p>

                          <p className="mt-1 break-all text-[10px] leading-4 text-neutral-400">
                            {lead._id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* PHONE */}

                    <td className={`${tdStyle} px-3 py-4`}>

                      {lead.phone ? (

                        <a
                          href={`tel:${lead.phone}`}
                          className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[#d5d0c3] bg-[#f5f3ec] px-2 py-2 text-[11px] font-semibold hover:bg-[#fff4b8]"
                        >

                          <Phone size={12} className="shrink-0" />

                          <span className="min-w-0 break-all">
                            {lead.phone}
                          </span>

                        </a>

                      ) : (

                        <span className="text-xs text-neutral-400">
                          —
                        </span>

                      )}

                    </td>

                    {/* RATING */}

                    <td className={`${tdStyle} px-3 py-4`}>

                      {lead.rating ? (

                        <span className="inline-flex items-center gap-1 rounded-lg border border-[#d8c47a] bg-[#fff4b8] px-2 py-2 text-xs font-bold">

                          <Star
                            size={12}
                            className="shrink-0 fill-[#c5a21a] text-[#c5a21a]"
                          />

                          {String(lead.rating)
                            .replace(/stars?/i, "")
                            .trim()}

                        </span>

                      ) : (

                        <span className="text-xs text-neutral-400">
                          —
                        </span>

                      )}

                    </td>

                    {/* ADDRESS */}

                    <td className={`${tdStyle} px-3 py-4`}>

                      <div className="min-w-0 rounded-lg border border-[#e0dcd1] bg-[#eeece5] p-3 shadow-inner">

                        <p className="break-words text-[11px] leading-5 text-neutral-600">
                          {cleanAddress(lead.address)}
                        </p>

                      </div>

                    </td>

                    {/* REMINDER */}

                    <td className={`${tdStyle} px-3 py-4`}>

                      {lead.reminder ? (

                        <div className="min-w-0 rounded-lg border border-[#d5d0c3] bg-[#f0eee7] p-2.5 text-[11px] leading-5 text-neutral-600 shadow-inner">

                          <Bell size={13} className="mb-2" />

                          <p className="break-words">
                            {formatDate(lead.reminder)}
                          </p>

                        </div>

                      ) : (

                        <span className="text-[11px] text-neutral-400">
                          Not set
                        </span>

                      )}

                    </td>

                    {/* LINKS */}

                    <td className={`${tdStyle} px-3 py-4`}>

                      <div className="flex min-w-0 flex-col items-start gap-2">

                        {lead.website ? (

                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${btn} min-h-9 max-w-full gap-1.5 px-2.5 text-[11px]`}
                          >
                            <Globe size={12} />
                            Website
                            <ExternalLink size={10} />
                          </a>

                        ) : (

                          <span className="rounded-md border border-[#e0dcd1] bg-[#eeece5] px-2 py-1.5 text-[10px] text-red-500">
                            No Website
                          </span>

                        )}

                        {lead.mapsUrl && (

                          <a
                            href={lead.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${btn} min-h-9 max-w-full gap-1.5 px-2.5 text-[11px]`}
                          >
                            <MapPin size={12} />
                            Maps
                            <ExternalLink size={10} />
                          </a>

                        )}

                      </div>

                    </td>

                    {/* ACTIONS */}

                    <td className={`${tdStyle} px-3 py-4`}>

                      <div className="flex min-w-0 flex-col gap-2">

                        <button
                          type="button"
                          onClick={() => openReminder(lead)}
                          className={`${yellowBtn} min-h-9 w-full justify-center gap-2 px-2 text-[11px]`}
                        >
                          <Bell size={13} className="shrink-0" />
                          Reminder
                        </button>

                        <button
                          type="button"
                          onClick={() => setConverted(lead._id)}
                          className={`${btn} min-h-9 w-full justify-center gap-2 px-2 text-[11px] text-green-700 hover:bg-green-50`}
                        >
                          <CheckCircle2 size={13} className="shrink-0" />
                          Converted
                        </button>

                        <button
                          type="button"
                          onClick={() => notIntrested(lead._id)}
                          className={`${btn} min-h-9 w-full justify-center gap-2 px-2 text-[11px] text-red-600 hover:bg-red-50`}
                        >
                          <Trash2 size={13} className="shrink-0" />
                          Not Interested
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </>

      )}

      {/* ================= FOOTER ================= */}

      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3 border-t border-[#d5d0c3] bg-[#f0eee7] px-4 py-4 text-xs font-medium text-neutral-500 sm:px-5">

        <span>
          {leads.length} businesses displayed
        </span>

        <span className="rounded-md border border-[#d5d0c3] bg-[#e9e6dc] px-3 py-1.5 text-[10px] font-semibold">
          {loading ? "Loading" : "Ready"}
        </span>

      </div>

    </div>

  </section>
);
      
  
}

export default Convert