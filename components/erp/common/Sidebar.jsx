"use client";

import React, { useState } from "react";
import {
  HomeIcon,
  ListBulletIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const [activeSection, setActiveSection] = useState("crm");
  const [expandedSections, setExpandedSections] = useState({
    crm: true,
    jobs: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const navigationItems = [
    {
      id: "home",
      label: "Home",
      icon: HomeIcon,
      href: "/",
      hasSubItems: false,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: HomeIcon,
      href: "/dashboard",
      hasSubItems: false,
    },
    {
      id: "crm",
      label: "CRM",
      icon: ListBulletIcon,
      href: "/crm",
      hasSubItems: true,
      subItems: [
        { id: "leads", label: "Leads", href: "/crm/leads" },
        { id: "customers", label: "Customers", href: "/crm/customers" },
      ],
    },
    {
      id: "jobs",
      label: "Jobs",
      icon: ClipboardDocumentListIcon,
      href: "/jobs",
      hasSubItems: true,
      subItems: [
        { id: "active", label: "Active Jobs", href: "/jobs/active" },
        { id: "completed", label: "Completed", href: "/jobs/completed" },
      ],
    },
  ];

  const bottomItems = [
    {
      id: "settings",
      label: "Settings",
      icon: Cog6ToothIcon,
      href: "/settings",
    },
  ];

  return (
    <div className="w-64 h-screen bg-bg-2 border-r border-border flex flex-col">
      {/* Header/Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-light rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-dark rounded-full"></div>
          </div>
          <span className="text-light font-bold text-lg">POTHOLE DOCTORS</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              {item.hasSubItems ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? "bg-bg text-light"
                        : "text-gray hover:text-light hover:bg-bg/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {expandedSections[item.id] ? (
                      <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </button>

                  {expandedSections[item.id] && (
                    <ul className="ml-8 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.id}>
                          <a
                            href={subItem.href}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray hover:text-light hover:bg-bg/30 transition-colors"
                          >
                            <div className="w-2 h-2 bg-gray rounded-full"></div>
                            <span className="text-sm">{subItem.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <a
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "bg-bg text-light"
                      : "text-gray hover:text-light hover:bg-bg/50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-4 space-y-4">
        {/* Settings */}
        <ul className="space-y-2">
          {bottomItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray hover:text-light hover:bg-bg/50 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-bg/30">
          <div className="w-10 h-10 bg-light rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-dark rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-light font-medium text-sm truncate">
              Liam Harper
            </p>
            <p className="text-gray text-xs truncate">patrikhgy@gmail.com</p>
          </div>
          <button className="p-1 text-gray hover:text-light transition-colors">
            <EllipsisVerticalIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
