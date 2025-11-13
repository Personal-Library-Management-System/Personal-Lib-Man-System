import { useNavigate } from 'react-router-dom';
import { FaBook, FaList, FaChartBar, FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa';

const MainPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/auth');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 30px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        marginBottom: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaBook color="white" size="20px" />
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              PLMS Dashboard
            </h1>
            <p style={{ 
              margin: 0, 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px'
            }}>
              Kişisel Kütüphane Yönetimi
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Kullanıcı Avatar */}
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaUser color="white" size="16px" />
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FaSignOutAlt size="14px" />
            Çıkış
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            color: 'white', 
            marginBottom: '12px',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            Hoş Geldiniz! 📚
          </h2>
          
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '18px',
            margin: 0
          }}>
            Kütüphanenizi yönetmeye başlayabilirsiniz.
          </p>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginTop: '40px'
        }}>
          {/* Kitaplarım Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '32px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <FaBook color="white" size="28px" />
            </div>
            <h3 style={{ 
              color: 'white', 
              marginBottom: '12px',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              Kitaplarım
            </h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              margin: 0
            }}>
              Kişisel kitap koleksiyonunuzu yönetin
            </p>
          </div>
          
          {/* Okuma Listesi Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '32px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <FaList color="white" size="28px" />
            </div>
            <h3 style={{ 
              color: 'white', 
              marginBottom: '12px',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              Okuma Listesi
            </h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              margin: 0
            }}>
              Okumak istediğiniz kitapları planlayın
            </p>
          </div>

          {/* İstatistikler Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '32px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <FaChartBar color="white" size="28px" />
            </div>
            <h3 style={{ 
              color: 'white', 
              marginBottom: '12px',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              İstatistikler
            </h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              margin: 0
            }}>
              Okuma alışkanlıklarınızı takip edin
            </p>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '12px',
            margin: 0
          }}>
            🚀 Bu özellikler yakında aktif olacak. PLMS v1.0.0 - Demo Sürüm
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainPage;