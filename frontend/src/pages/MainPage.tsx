import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/auth');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      padding: '20px'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>
          PLMS Ana Sayfa
        </h1>
        
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Çıkış Yap
        </button>
      </header>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '40px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          Hoş Geldiniz! 📚
        </h2>
        
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Kütüphanenizi yönetmeye başlayabilirsiniz.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3>Kitaplarım</h3>
            <p>Yakında...</p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3>Okuma Listesi</h3>
            <p>Yakında...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;