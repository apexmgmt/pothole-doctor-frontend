import React from "react";
import CustomButton from "./CustomButton";
import { BellIcon, SearchIcon } from "@/public/icons/icons";
// import { CiSearch } from "react-icons/ci";
// import { IoIosNotificationsOutline } from "react-icons/io";

const Header = () => {
  return (
    <header className="flex items-center justify-between gap-5 px-5 py-2.5 bg-dark text-white border-b border-b-border">
      <div className="text-xl font-semibold text-light-2">CRM</div>
      <div className="flex gap-2">
        <CustomButton
          icon={SearchIcon}
          variant="outline"
          className="!p-2.5 rounded-xl"
        />
        <CustomButton
          icon={BellIcon}
          variant="outline"
          className="!p-2.5 rounded-xl"
        />
      </div>
    </header>
  );
};

export default Header;
