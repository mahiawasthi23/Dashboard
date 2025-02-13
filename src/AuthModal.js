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
  sethomeText,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
      <h1>Form</h1>
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
        <div>
        {isSignUp ? (
          <button onClick={handleSignup}>Sign Up</button>
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}
        <button onClick={() => {setShowForm(false);sethomeText(true);}}>Close</button>
        </div>
        <button onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Switch to Login" : "Switch to Sign Up"}
        </button>
        
      </div>
    </div>
  );
}
