import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaGoogle } from 'react-icons/fa';
import bookIcon from '../components/icons/image.png';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/main');
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '448px', width: '100%' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
            textAlign: 'center'
          }}>
            {/* Custom SVG Logo */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%', // Yuvarlak yapar
              overflow: 'hidden', // Taşan kısımları keser
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
              border: '3px solid #3b82f6' // İsteğe bağlı border
            }}>
              <img 
                src={bookIcon} 
                alt="PLMS Logo" 
                style={{
                  width: '100%', // Container'ı tamamen doldurur
                  height: '100%',
                  objectFit: 'cover', // Resmi kırpmadan sığdırır, yuvarlağı doldurur
                  objectPosition: 'center' // Resmi ortalar
                }}
              />
            </div>
            
            {/* Başlık */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{
                fontSize: '48px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #374151, #111827)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                PLMS
              </h1>
              
              <p style={{
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: '500',
                margin: 0
              }}>
                Kişisel Kütüphane Yönetim Sistemi
              </p>
            </div>

            {/* Alert */}
            <div style={{
              width: '100%',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <span style={{ color: 'white', fontSize: '12px' }}>ℹ</span>
              </div>
              <div>
                <div style={{
                  color: '#1e40af',
                  fontWeight: '600',
                  fontSize: '14px',
                  marginBottom: '4px'
                }}>
                  Demo Sürümü
                </div>
                <div style={{
                  color: '#1d4ed8',
                  fontSize: '12px'
                }}>
                  Butona tıklayarak ana sayfaya geçebilirsiniz
                </div>
              </div>
            </div>

            {/* Google Giriş Butonu */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: isLoading ? '#f3f4f6' : 'white',
                color: isLoading ? '#9ca3af' : '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                boxShadow: isLoading ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid transparent',
                    borderTop: '2px solid #9ca3af',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google ile Giriş Yap
                </>
              )}
            </button>

            {/* Alt Bilgi */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'center'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0,
                textAlign: 'center'
              }}>
                📚 Kitaplarınızı organize edin, okuma deneyiminizi geliştirin
              </p>
              <p style={{
                fontSize: '12px',
                color: '#9ca3af',
                margin: 0
              }}>
                v1.0.0 - Demo Sürüm
              </p>
            </div>
          </div>
        </div>

        {/* Ek Bilgi Kartı */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <p style={{
            fontSize: '14px',
            color: 'white',
            textAlign: 'center',
            fontWeight: '500',
            margin: 0
          }}>
            ✨ Modern, hızlı ve kullanıcı dostu kütüphane yönetimi
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;