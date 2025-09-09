"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CRMIcon,
  EstimateIcon,
  HomeIcon,
  SettingsIcon,
  UserIcon,
} from "@/public/icons/icons";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const Sidebar = () => {
  const [activeSection, setActiveSection] = useState("crm");
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const navigationItems = [
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
      icon: CRMIcon,
      href: "/crm",
      hasSubItems: true,
      subItems: [
        {
          id: "leads",
          label: "Leads",
          href: "/crm/leads",
          icon: CRMIcon,
          hasSubItems: true,
          subItems: [
            {
              id: "leads-sub-1",
              label: "Lead Management",
              href: "/crm/leads/management",
              icon: CRMIcon,
            },
            {
              id: "leads-sub-2",
              label: "Lead Analytics",
              href: "/crm/leads/analytics",
              icon: CRMIcon,
            },
          ],
        },
        {
          id: "customers",
          label: "Customers",
          href: "/crm/customers",
          hasSubItems: true,
          icon: CRMIcon,
          subItems: [
            {
              id: "customers-sub-1",
              label: "Customer List",
              href: "/crm/customers/list",
              icon: CRMIcon,
            },
            {
              id: "customers-sub-2",
              label: "Customer Details",
              href: "/crm/customers/details",
              icon: CRMIcon,
            },
          ],
        },
      ],
    },
    {
      id: "users",
      label: "Users",
      icon: UserIcon,
      href: "/users",
      hasSubItems: true,
      subItems: [
        {
          id: "sub-users-01",
          label: "Sub Users 01",
          href: "/users/sub-users-01",
          hasSubItems: true,
          subItems: [
            {
              id: "users-sub-1",
              label: "User Permissions",
              href: "/users/sub-users-01/permissions",
            },
            {
              id: "users-sub-2",
              label: "User Roles",
              href: "/users/sub-users-01/roles",
            },
          ],
        },
        {
          id: "sub-users-02",
          label: "Sub Users 02",
          href: "/users/sub-users-02",
          hasSubItems: true,
          subItems: [
            {
              id: "users-sub-3",
              label: "User Groups",
              href: "/users/sub-users-02/groups",
            },
            {
              id: "users-sub-4",
              label: "User Settings",
              href: "/users/sub-users-02/settings",
            },
          ],
        },
      ],
    },
    {
      id: "estimate",
      label: "Estimate",
      icon: EstimateIcon,
      href: "/estimate",
      hasSubItems: true,
      subItems: [
        {
          id: "sub-estimates-01",
          label: "Sub Estimates 01",
          href: "/estimate/sub-estimates-01",
          hasSubItems: true,
          subItems: [
            {
              id: "estimate-sub-1",
              label: "Estimate Templates",
              href: "/estimate/sub-estimates-01/templates",
            },
            {
              id: "estimate-sub-2",
              label: "Estimate History",
              href: "/estimate/sub-estimates-01/history",
            },
          ],
        },
        {
          id: "sub-estimates-02",
          label: "Sub Estimates 02",
          href: "/estimate/sub-estimates-02",
          hasSubItems: true,
          subItems: [
            {
              id: "estimate-sub-3",
              label: "Estimate Reports",
              href: "/estimate/sub-estimates-02/reports",
            },
            {
              id: "estimate-sub-4",
              label: "Estimate Settings",
              href: "/estimate/sub-estimates-02/settings",
            },
          ],
        },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      href: "/settings",
      hasSubItems: true,
      subItems: [
        {
          id: "sub-settings-01",
          label: "Sub Settings 01",
          href: "/settings/sub-settings-01",
          hasSubItems: true,
          subItems: [
            {
              id: "settings-sub-1",
              label: "General Settings",
              href: "/settings/sub-settings-01/general",
            },
            {
              id: "settings-sub-2",
              label: "Security Settings",
              href: "/settings/sub-settings-01/security",
            },
          ],
        },
        {
          id: "sub-settings-02",
          label: "Sub Settings 02",
          href: "/settings/sub-settings-02",
          hasSubItems: true,
          subItems: [
            {
              id: "settings-sub-3",
              label: "Notification Settings",
              href: "/settings/sub-settings-02/notifications",
            },
            {
              id: "settings-sub-4",
              label: "Advanced Settings",
              href: "/settings/sub-settings-02/advanced",
            },
          ],
        },
      ],
    },
  ];

  const bottomItems = [];

  // Recursive component to render menu items with unlimited depth
  const renderMenuItem = (item, level = 0) => {
    const isActive = activeSection === item.id;
    const isExpanded = expandedSections[item.id];
    const paddingLeft = level * 16; // 16px per level

    if (item.hasSubItems && item.subItems) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleSection(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
              isActive
                ? "bg-border/40 text-light"
                : "text-gray hover:text-light hover:bg-bg/50"
            }`}
            style={{ paddingLeft: `${paddingLeft + 12}px` }}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </div>
            {isExpanded ? ArrowUpIcon : ArrowDownIcon}
          </button>

          {isExpanded && (
            <ul className="space-y-1 mt-2">
              {item.subItems.map((subItem) => (
                <li key={subItem.id}>{renderMenuItem(subItem, level + 1)}</li>
              ))}
            </ul>
          )}
        </div>
      );
    } else {
      return (
        <a
          key={item.id}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            isActive
              ? "bg-bg text-light"
              : "text-gray hover:text-light hover:bg-bg/50"
          }`}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          {item.icon}
          <span className="font-medium">{item.label}</span>
        </a>
      );
    }
  };

  return (
    <div className="w-full h-screen bg-bg-2 border-r border-border flex flex-col">
      {/* Header/Logo */}
      <Link href={"/erp"} className="px-4 py-3 border-b border-border">
        <Image
          src="/images/dashboard/logo.webp"
          alt="logo"
          width={90}
          height={37}
        />
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>{renderMenuItem(item)}</li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-4 space-y-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-bg/30">
          <div className="w-10 h-10 rounded-full">
            <Image
              src="/images/dashboard/user.webp"
              alt="profile"
              fill
              className="object-cover !relative"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-light font-medium text-sm truncate">
              Liam Harper
            </p>
            <p className="text-gray text-xs truncate">patrikhgy@gmail.com</p>
          </div>
          <button className="p-1 text-gray hover:text-light transition-colors">
            {/* <EllipsisVerticalIcon className="w-4 h-4" /> */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
