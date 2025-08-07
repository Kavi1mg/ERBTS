import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assets/logo.jpg';
import umbrella from '../assets/umbrella.png';


function Register() {
  const [hospitalId, setHospitalId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hospital');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/register', {
        hospitalId,
        password,
        role
      });

      if (res.data.success) {
        alert('Registered successfully');
        navigate('/login');
      } else {
        alert('Registration failed');
      }
    } catch (err) {
      alert('Error during registration');
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src={clock} alt="Clock" />
        <img src={clock} alt="Umbrella" />
      </div>
      <form className="login-form" onSubmit={handleRegister}>
        <img src={logo} alt="Logo" className="login-logo" />
        <h2>Register</h2>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="form-control"
        >
          <option value="admin">Admin</option>
          <option value="hospital">Hospital</option>
        </select>

        <input
          type="text"
          className="form-control"
          placeholder="Hospital ID"
          value={hospitalId}
          onChange={(e) => setHospitalId(e.target.value)}
          required
        />

        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary w-100">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
