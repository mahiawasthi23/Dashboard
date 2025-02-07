import React from "react";

export function AuthModal({
  email,
  setEmail,
  password,
  setPassword,
  handleSignup,
  handleLogin,
  isSignUp,
  setIsSignUp,
  setShowForm,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {isSignUp ? (
          <button onClick={handleSignup}>Sign Up</button>
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}
        <button onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Switch to Login" : "Switch to Sign Up"}
        </button>
        <button onClick={() => setShowForm(false)}>Close</button>
      </div>
    </div>
  );
}
