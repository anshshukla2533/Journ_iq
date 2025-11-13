import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error) {
        console.error('Authentication failed:', error);
        navigate('/login');
        return;
      }

      if (token) {
        // Store the token and user data
        localStorage.setItem('token', token);
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // If no token is present, redirect to login
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [navigate, location]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Authenticating...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;