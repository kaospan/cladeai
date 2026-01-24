import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/shared';
import { useAuth } from '@/hooks/useAuth';

const AuthGatePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) {
      navigate('/feed', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default AuthGatePage;
