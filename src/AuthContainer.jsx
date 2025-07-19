import React from "react";
import AuthForm from "./AuthForm";
import "./AuthContainer.css";

const AuthContainer = ({ onLogin }) => (
  <div className="auth-bg">
    <div className="auth-card">
      <h1 className="auth-logo">LearnInColor</h1>
      <AuthForm onLogin={onLogin} />
    </div>
  </div>
);

export default AuthContainer; 