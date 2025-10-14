import React, { useState } from 'react';
import './Login.css';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope } from 'react-icons/fa';

function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  return ( 
    <div className="login-form">
      <div className="avatar">
        <FaUser />
      </div>
      <h2>Connexion</h2>

      {/* Champ utilisateur avec icône email */}
      <div className="form-group">
        <label>Nom d’utilisateur</label>
        <div className="input-with-icon">
          <FaEnvelope className="icon" />
          <input type="text" placeholder="Entrez votre nom d’utilisateur" />
        </div>
      </div>

      {/* Champ mot de passe avec icône cadenas et toggle */}
      <div className="form-group password-group">
        <label>Mot de passe</label>
        <div className="password-input input-with-icon">
          <FaLock className="icon" />
          <input 
            type={passwordVisible ? "text" : "password"} 
            placeholder="Entrez votre mot de passe" 
          />
          <span className="password-toggle" onClick={togglePassword}>
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>

      <div className="options">
        <label><input type="checkbox" /> Se souvenir de moi</label>
        <a href="#">Mot de passe oublié ?</a>
      </div>
      <button type="submit">LOGIN</button>
    </div>
  );
}

export default Login;
