
import React, { useState } from 'react';
import './Login.css';
import logo from '../assets/logo.jpg';
import umbrella from '../assets/umbrella.png';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email && password) {
      if (role === 'admin') navigate('/admin');
      else navigate('/hospital');
    }
  };

  return (
    <div className="login-page">
      <img src={logo} alt="logo" className="logo-img" />
      <img src={umbrella} alt="umbrella" className="umbrella-img" />
      <div className="login-container">
        <h2 className="title">Login</h2>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="role-selection">
          <label>
            <input
              type="radio"
              value="admin"
              checked={role === 'admin'}
              onChange={() => setRole('admin')}
            />
            Admin
          </label>
          <label>
            <input
              type="radio"
              value="hospital"
              checked={role === 'hospital'}
              onChange={() => setRole('hospital')}
            />
            Hospital Staff
          </label>
        </div>
        <button onClick={handleLogin}>Login</button>
        <p className="register-link" onClick={() => navigate('/register')}>
          Register
        </p>
      </div>
    </div>
  );
}

export default Login;
