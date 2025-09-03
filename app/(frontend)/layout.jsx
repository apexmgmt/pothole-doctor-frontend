import Footer from "@/components/frontend/common/Footer";
import Header from "@/components/frontend/common/Header";
import React from "react";

const layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default layout;
