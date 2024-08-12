import React, { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoIosArrowRoundBack, IoIosNotifications } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa6";

import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { MdArrowDropDown } from "react-icons/md";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="fixed flex h-16 pt-2 shadow-md w-full justify-between items-center px-1 md:px-4 z-10 bg-blue-600">
      <Link to={"/"}>
        <div>
          <FaArrowLeft className="w-25 h-14 items-center text-white pb-1 ml-2 text-xl" />
        </div>
      </Link>

      <div className="flex justify-between items-center">
        <div className="text-2xl md:text-4xl mr-6 relative">
          <Link
            to={"/notifiactions"}
            onClick={() => window.scrollTo({ top: "0" })}
          >
            <IoIosNotifications className="text-white" />
            <div className="absolute -top-2 -right-3 text-white bg-orange-500 md:h-6 md:w-6 h-4 w-4 rounded-full m-0 p-0 text-sm text-center ">
              2
            </div>
          </Link>
        </div>
        <div className="relative">
          <div className="flex text-2xl md:text-5xl md:px-4 items-center space-x-2">
            <div className="max-w-[50px] max-h-[50px]">
              <img
                src="https://wallpapers.com/images/featured/cool-profile-picture-87h46gcobjl5e4xu.jpg"
                alt="Profile"
                className="w-full h-full rounded-full cursor-pointer"
              />
            </div>
            <div className="flex-col">
              <div className=" text-base">
                <div className="flex">
                  <div className="text-white">Jason Lee L.W.</div>
                  <MdArrowDropDown
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex justify-center items-center text-2xl text-white"
                  />
                </div>
              </div>

              <div className="text-base text-gray-400">Sales Lead</div>
            </div>
          </div>
          <DropdownMenu showMenu={showMenu} setShowMenu={setShowMenu} />
        </div>
      </div>
    </div>
  );
};

export default Header;
