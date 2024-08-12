import React from "react";

const DropdownMenu = ({ showMenu, setShowMenu }) => {
  return (
    <div
      className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg ${
        showMenu ? "block" : "hidden"
      }`}
    >
      <ul className="py-1">
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => setShowMenu(false)}
        >
          Profile
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => setShowMenu(false)}
        >
          Settings
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => setShowMenu(false)}
        >
          Logout
        </li>
      </ul>
    </div>
  );
};

export default DropdownMenu;
