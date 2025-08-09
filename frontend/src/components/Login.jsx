import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const [hospitalId, setHospitalId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hospital');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/login', {
        role,
        hospitalId,
        password
        
      });

      if (res.data.success) {
  localStorage.setItem('hospitalId', res.data.hospitalId);
  localStorage.setItem('role', res.data.role);

  if (res.data.role === 'admin') {
    navigate('/adminPanel');
  } else {
    navigate('/HospitalDashboard');
  }
} else {
        alert('Invalid credentials');
      }
    } catch (err) {
      alert('Error logging in');
    }
  };

  return (
    <div className="login-background d-flex align-items-center justify-content-center">
      <form className="login-box p-4 rounded shadow" onSubmit={handleLogin}>
        <h2 className="text-center mb-4">Login</h2>

        <select
          className="form-control mb-3"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="hospital">Hospital</option>
        </select>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="User ID"
          value={hospitalId}
          onChange={(e) => setHospitalId(e.target.value)}
          required
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn btn-primary w-100" type="submit">
          Login
        </button>
         <p className="mt-3 text-center">
    Don't have an account? <a href="/register">Register here</a>
  </p>
      </form>
    </div>
  );
}

export default Login;
