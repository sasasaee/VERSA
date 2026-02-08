import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setToast({ message: '✓ Registration Successful! Redirecting to login...', type: 'success' });

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setToast({ message: data.message || 'Registration Failed', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: 'Server Error. Is the backend running?', type: 'error' });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="bg-skin-card p-10 rounded-2xl shadow-xl w-96 border border-skin-muted/10">
        <h2 className="text-3xl font-serif font-bold mb-8 text-center text-skin-primary">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full p-3 bg-skin-base border border-skin-muted rounded-lg focus:outline-none focus:border-skin-primary text-skin-text placeholder-skin-muted/50 transition-colors"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 bg-skin-base border border-skin-muted rounded-lg focus:outline-none focus:border-skin-primary text-skin-text placeholder-skin-muted/50 transition-colors"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 bg-skin-base border border-skin-muted rounded-lg focus:outline-none focus:border-skin-primary text-skin-text placeholder-skin-muted/50 transition-colors"
            required
          />
          <button
            type="submit"
            className="w-full bg-skin-secondary text-white p-3 rounded-lg font-bold hover:brightness-110 transition-all shadow-md active:scale-95"
          >
            Register
          </button>

          <div className="mt-6 text-center text-skin-muted">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-skin-primary font-bold hover:underline">
                Login here
              </Link>
            </p>
          </div>

          <div className="text-center text-skin-muted mt-4">
            <Link to="/about" className="text-skin-primary font-medium hover:underline">
              Learn more about VERSA
            </Link>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Register;
