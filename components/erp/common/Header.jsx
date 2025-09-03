import React from "react";
import CustomButton from "./CustomButton";
import { CiSearch } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";

const Header = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-black text-white">
      <div className="text-xl font-bold">CRM</div>
      <div className="flex space-x-4">
        <CustomButton
          icon={<CiSearch className="text-white w-6 h-6" />}
          containerStyles="rounded-full p-2 bg-gray-800 hover:bg-gray-700"
        />
        <CustomButton
          icon={<IoIosNotificationsOutline className="text-white w-6 h-6" />}
          containerStyles="rounded-full p-2 bg-gray-800 hover:bg-gray-700"
        />
      </div>
    </div>
  );
};

export default Header;
