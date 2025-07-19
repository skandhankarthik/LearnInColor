import React, { useState } from "react";
import "./AuthForm.css";

const AuthForm = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup && !form.name) {
      setError("Name is required for sign up.");
      return;
    }
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    setError("");
    // Simulate login/signup success
    if (onLogin) {
      onLogin(form.email);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isSignup && (
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            required={isSignup}
          />
        </div>
      )}
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
        />
      </div>
      {error && <div className="auth-error" role="alert">{error}</div>}
      <button className="auth-submit" type="submit">
        {isSignup ? "Sign Up" : "Log In"}
      </button>
      <div className="auth-toggle">
        {isSignup ? (
          <span>
            Already have an account?{' '}
            <button type="button" onClick={() => setIsSignup(false)} className="auth-link">Log in</button>
          </span>
        ) : (
          <span>
            Don&apos;t have an account?{' '}
            <button type="button" onClick={() => setIsSignup(true)} className="auth-link">Sign up</button>
          </span>
        )}
      </div>
    </form>
  );
};

export default AuthForm; 