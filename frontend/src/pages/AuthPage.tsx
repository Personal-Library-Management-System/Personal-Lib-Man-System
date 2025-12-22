import bookIcon from '../components/icons/image.png';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const navigate = useNavigate();

    const handleLoginSuccess = async (credentialResponse: any) => {
        const idToken = credentialResponse.credential;
        console.log(jwtDecode(idToken));
        const res = await fetch('http://localhost:5000/api/v1/auth/google', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
        });
        const data = await res.json();
        console.log(data);
        
        if (res.ok) {
            // Redirect to main page after successful login
            navigate('/main');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
        >
            <div style={{ maxWidth: '448px', width: '100%' }}>
                <div
                    style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid #f3f4f6',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '32px',
                            textAlign: 'center',
                        }}
                    >
                        {/* Custom SVG Logo */}
                        <div
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%', // Yuvarlak yapar
                                overflow: 'hidden', // Taşan kısımları keser
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow:
                                    '0 10px 25px rgba(59, 130, 246, 0.3)',
                                border: '3px solid #3b82f6', // İsteğe bağlı border
                            }}
                        >
                            <img
                                src={bookIcon}
                                alt="PLMS Logo"
                                style={{
                                    width: '100%', // Container'ı tamamen doldurur
                                    height: '100%',
                                    objectFit: 'cover', // Resmi kırpmadan sığdırır, yuvarlağı doldurur
                                    objectPosition: 'center', // Resmi ortalar
                                }}
                            />
                        </div>

                        {/* Başlık */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            <h1
                                style={{
                                    fontSize: '48px',
                                    fontWeight: 'bold',
                                    background:
                                        'linear-gradient(135deg, #374151, #111827)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    margin: 0,
                                }}
                            >
                                PLMS
                            </h1>

                            <p
                                style={{
                                    fontSize: '18px',
                                    color: '#6b7280',
                                    fontWeight: '500',
                                    margin: 0,
                                }}
                            >
                                Personal Library Management System
                            </p>
                        </div>

                        {/* Alert */}
                        <div
                            style={{
                                width: '100%',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '12px',
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                            }}
                        >
                            <div
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: '#3b82f6',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '2px',
                                }}
                            >
                                <span
                                    style={{ color: 'white', fontSize: '12px' }}
                                >
                                    ℹ
                                </span>
                            </div>
                            <div>
                                <div
                                    style={{
                                        color: '#1e40af',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        marginBottom: '4px',
                                    }}
                                >
                                    Demo Version
                                </div>
                                <div
                                    style={{
                                        color: '#1d4ed8',
                                        fontSize: '12px',
                                    }}
                                >
                                    Click the button to go to the main page
                                </div>
                            </div>
                        </div>

                        {/* Google Giriş Butonu */}
                        <GoogleLogin
                            onSuccess={handleLoginSuccess}
                        ></GoogleLogin>

                        {/* Alt Bilgi */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                alignItems: 'center',
                            }}
                        >
                            <p
                                style={{
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    margin: 0,
                                    textAlign: 'center',
                                }}
                            >
                                📚 Organize your books, enhance your reading
                                experience
                            </p>
                            <p
                                style={{
                                    fontSize: '12px',
                                    color: '#9ca3af',
                                    margin: 0,
                                }}
                            >
                                v1.0.0 - Demo Version
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ek Bilgi Kartı */}
                <div
                    style={{
                        marginTop: '24px',
                        padding: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                >
                    <p
                        style={{
                            fontSize: '14px',
                            color: 'white',
                            textAlign: 'center',
                            fontWeight: '500',
                            margin: 0,
                        }}
                    >
                        ✨ Modern, fast and user-friendly library management
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
