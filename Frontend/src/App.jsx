import React, { useEffect } from "react";
import apiRequest from "./utils/apiRequest";
import { useDispatch } from "react-redux";
import { setCheckingAuth, setCurrentUser } from "./features/usersSlice";
import { Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest.get("/users");
        const user = response.data.data;
        dispatch(setCurrentUser(user));
      } catch (err) {
        dispatch(setCheckingAuth(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<ProtectedRoute />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};

export default App;
