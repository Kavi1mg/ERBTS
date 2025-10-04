// import { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './Login.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import logo from '../assets/logo.png';
// import umbrella from '../assets/umbrella.png';

// function Login() {
//   const [hospitalId, setHospitalId] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('hospital');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post('http://localhost:3001/api/login', {
//         role,
//         hospitalId,
//         password
//       });

//       if (res.data.success) {
//         localStorage.setItem('hospitalId', res.data.hospitalId);
//         localStorage.setItem('role', res.data.role);

//         if (res.data.role === 'admin') {
//           navigate('/adminPanel');
//         } else {
//           navigate('/HospitalDashboard');
//         }
//       } else {
//         alert('Invalid credentials');
//       }
//     } catch (err) {
//       alert('Error logging in');
//     }
//   };

//   return (
//     <div className="login-page">
//       {/* Logo + Umbrella */}
//       <img src={logo} alt="logo" className="logo-img" />
//       <img src={umbrella} alt="umbrella" className="umbrella-img" />

//       <div className="login-container">
//         <h2 className="title">Login</h2>

//         <form onSubmit={handleLogin} className="login-form">
//           {/* User ID */}
//           <input
//             type="text"
//             placeholder="User ID"
//             value={hospitalId}
//             onChange={(e) => setHospitalId(e.target.value)}
//             required
//           />

//           {/* Password */}
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           {/* Role Selection */}
//           <div className="role-selection">
//             <label>
//               <input
//                 type="radio"
//                 value="admin"
//                 checked={role === 'admin'}
//                 onChange={() => setRole('admin')}
//               />
//               Admin
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 value="hospital"
//                 checked={role === 'hospital'}
//                 onChange={() => setRole('hospital')}
//               />
//               Hospital Staff
//             </label>
//           </div>

//           {/* Login Button */}
//           <button type="submit">Login</button>
//         </form>

//         {/* Register Link */}
//         <p
//           className="register-link"
//           onClick={() => navigate('/register')}
//         >
//           Register
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;



// import { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './Login.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import logo from '../assets/logo.png';
// import umbrella from '../assets/umbrella.png';

// function Login() {
//   const [hospitalId, setHospitalId] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('hospital');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post('http://localhost:3001/api/login', {
//         role,
//         hospitalId,
//         password
//       });

//       if (res.data.success) {
//         // ✅ Save hospitalId and role in localStorage
//         localStorage.setItem('hospitalId', res.data.hospitalId);
//         localStorage.setItem('role', res.data.role);

//         // ✅ Navigate based on role
//         if (res.data.role === 'admin') {
//           navigate('/adminPanel');
//         } else {
//           navigate('/HospitalDashboard');
//         }
//       } else {
//         alert('Invalid credentials');
//       }
//     } catch (err) {
//       alert('Error logging in');
//     }
//   };

//   return (
//     <div className="login-page">
//       <img src={logo} alt="logo" className="logo-img" />
//       <img src={umbrella} alt="umbrella" className="umbrella-img" />

//       <div className="login-container">
//         <h2 className="title">Login</h2>

//         <form onSubmit={handleLogin} className="login-form">
//           <input
//             type="text"
//             placeholder="User ID"
//             value={hospitalId}
//             onChange={(e) => setHospitalId(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           <div className="role-selection">
//             <label>
//               <input
//                 type="radio"
//                 value="admin"
//                 checked={role === 'admin'}
//                 onChange={() => setRole('admin')}
//               />
//               Admin
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 value="hospital"
//                 checked={role === 'hospital'}
//                 onChange={() => setRole('hospital')}
//               />
//               Hospital Staff
//             </label>
//           </div>

//           <button type="submit">Login</button>
//         </form>

//         <p className="register-link" onClick={() => navigate('/register')}>
//           Register
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assets/logo.png';
import umbrella from '../assets/umbrella.png';

function Login() {
  const [hospitalId, setHospitalId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('hospital');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Admin hardcoded login check
    if (role === 'admin') {
      if (hospitalId === 'admin001' && password === 'admin123') {
        localStorage.setItem('hospitalId', 'admin001');
        localStorage.setItem('role', 'admin');
        navigate('/adminPanel');
      } else {
        alert('Invalid admin credentials');
      }
      return;
    }

    // Hospital staff login - backend call (original logic unchanged)
    if (role === 'hospital') {
      try {
        const res = await axios.post('http://localhost:3001/api/login', {
          role,
          hospitalId,
          password,
        });

        if (res.data.success) {
          localStorage.setItem('hospitalId', res.data.hospitalId);
          localStorage.setItem('role', res.data.role);
          navigate('/HospitalDashboard');
        } else {
          alert('Invalid credentials');
        }
      } catch (err) {
        alert('Error logging in');
      }
      return;
    }
  };

  return (
    <div className="login-page">
      <img src={logo} alt="logo" className="logo-img" />
      <img src={umbrella} alt="umbrella" className="umbrella-img" />

      <div className="login-container">
        <h2 className="title">Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="User ID"
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
            required
          />
          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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

          <button type="submit">Login</button>
        </form>

        {/* Register Link */}
        <p className="register-link" onClick={() => navigate('/register')}>
          Register
        </p>
      </div>
    </div>
  );
}

export default Login;
