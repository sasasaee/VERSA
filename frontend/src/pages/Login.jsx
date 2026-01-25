import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // SAVE THE TOKEN
        localStorage.setItem('token', data.token);
        
        // Optional: Remove alert for a smoother feel, or keep it if you like
        alert('Login Successful!');
        navigate('/'); 
      } else {
        alert(data.message || 'Login Failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server Error');
    }
  };

  return (
    // Updated container with theme colors
    <div className="flex items-center justify-center h-screen px-4">
      <div className="bg-skin-card p-10 rounded-2xl shadow-xl w-96 border border-skin-primary/20">
        
        <h2 className="text-3xl font-serif font-bold mb-8 text-center text-skin-primary">
          Login
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="w-full p-3 bg-skin-base border border-skin-muted rounded-lg focus:outline-none focus:border-skin-primary text-skin-text placeholder-skin-muted/50 transition-colors"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 bg-skin-base border border-skin-muted rounded-lg focus:outline-none focus:border-skin-primary text-skin-text placeholder-skin-muted/50 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-skin-secondary text-white p-3 rounded-lg font-bold hover:brightness-110 transition-all shadow-md active:scale-95"
          >
            Enter Versa
          </button>
          <div className="mt-6 text-center text-skin-muted">
            <p>
                Don't have an account?{' '}
                <Link to="/register" className="text-skin-primary font-bold hover:underline">
                Register here
                </Link>
            </p>
        </div>
        </form>
      </div>
    </div>
  );
};

export default Login;