import Header from "@/components/erp/common/Header";
import Sidebar from "@/components/erp/common/Sidebar";
import React from "react";

const layout = ({ children }) => {
  return (
    <section className="flex items-start min-h-screen relative overflow-hidden">
      <aside className="w-[260px]">
        <Sidebar />
      </aside>
      <section className="flex-1">
        <Header />
        <main>{children}</main>
      </section>
    </section>
  );
};

export default layout;
