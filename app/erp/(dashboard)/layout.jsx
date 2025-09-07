import Header from "@/components/erp/common/Header";
import Sidebar from "@/components/erp/common/Sidebar";
import React from "react";

const layout = ({ children }) => {
  return (
    <section className="flex min-h-screen relative overflow-hidden h-screen">
      <aside className="w-[260px]">
        <Sidebar />
      </aside>
      <section className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </section>
    </section>
  );
};

export default layout;
