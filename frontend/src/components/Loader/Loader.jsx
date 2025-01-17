import React from "react";

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-12 h-12 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
    </div>
  );
}

export default Loader;
