import React from "react";

import Footer from "@/components/frontend/common/Footer";
import Header from "@/components/frontend/common/Header";

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
