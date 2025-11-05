import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 sm:px-6">
  <div className="max-w-3xl mx-auto flex items-center justify-start">
    <div className="flex items-center space-x-3">
     
      <div>
        <img
              src="images/header_logo.jpeg"
              alt="StratSyfnc Logo"
              className="h-9 w-auto mx-auto "
            />
      </div>
    </div>
  </div>
</header>

  );
};

export default Header;
