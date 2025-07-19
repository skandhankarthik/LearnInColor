import React, { useState } from "react";
import LandingPage from "./LandingPage";
import AuthContainer from "./AuthContainer";
import Dashboard from "./Dashboard";

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (email) => {
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  if (isLoggedIn) {
    return <Dashboard email={userEmail} />;
  }

  return showAuth ? (
    <AuthContainer onLogin={handleLogin} />
  ) : (
    <LandingPage onGetStarted={() => setShowAuth(true)} />
  );
}

export default App;
