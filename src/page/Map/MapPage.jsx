import { useAuth } from "../../context/AuthContext";
import React, { useState } from "react";

const MapPage = () => {
  const { auth } = useAuth();
  return <p>User Role: {auth.role}</p>;
};
export default MapPage;
