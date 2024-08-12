import React from "react";
import TransactionList from "./pages/TransactionList";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import toast, { Toaster } from "react-hot-toast";

document.body.style.zoom = "75%";

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Toaster />
      <div className="pt-16 min-h-[calc(100vh)] h-full  relative">
        <Routes>
          <Route path="" element={<TransactionList />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
