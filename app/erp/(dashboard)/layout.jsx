import Sidebar from "@/components/erp/common/Sidebar";
import React from "react";

const layout = ({ children }) => {
  return (
    <section className="flex items-start min-h-screen relative overflow-hidden">
      <aside className="w-[260px]">
        <Sidebar />
      </aside>
      <main className="flex-1">{children}</main>
    </section>
  );
};

export default layout;
