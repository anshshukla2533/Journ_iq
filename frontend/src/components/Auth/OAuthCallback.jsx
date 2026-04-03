import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeOAuth } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error) {
        console.error('Authentication failed:', error);
        navigate('/login', { replace: true });
        return;
      }

      const success = await completeOAuth(token);
      navigate(success ? '/dashboard' : '/login', { replace: true });
    };

    handleOAuthCallback();
  }, [completeOAuth, location.search, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Authenticating...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
