import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { api } from './config/api';
import './App.css';

function AppContent() {
  const { user, isConnected, isAuthenticated, connectWallet, signIn, signOut, loading } = useAuth();
  const [profileStatus, setProfileStatus] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const handleGetProfile = async () => {
    const res = await api.get('/profile/status');
    if (res.ok) {
      setProfileStatus(res.profile);
    } else {
      alert(res.error || '프로필 조회 실패');
    }
  };

  const handleSaveProfile = async () => {
    const data = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const res = await api.post('/profile', { data });
    if (res.ok) {
      alert('프로필 저장 성공!');
      handleGetProfile();
    } else {
      alert(res.error || '프로필 저장 실패');
    }
  };

  const handleGetOrders = async () => {
    const res = await api.get('/orders/me');
    if (res.ok) {
      setOrders(res.orders || []);
    } else {
      alert(res.error || '주문 조회 실패');
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>NFT Bot - Web3 쇼핑몰</h1>
        <div className="auth-section">
          {!isConnected ? (
            <button onClick={connectWallet} className="btn btn-primary">
              지갑 연결
            </button>
          ) : !isAuthenticated ? (
            <button onClick={signIn} className="btn btn-primary">
              로그인
            </button>
          ) : (
            <div className="user-info">
              <span className="address">
                {user?.address.slice(0, 6)}...{user?.address.slice(-4)}
              </span>
              <button onClick={signOut} className="btn btn-secondary">
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main">
        {!isAuthenticated ? (
          <div className="welcome">
            <h2>지갑을 연결하고 로그인해주세요</h2>
            <p>MetaMask 지갑을 사용하여 Web3 인증을 진행합니다.</p>
          </div>
        ) : (
          <div className="content">
            <section className="section">
              <h2>프로필 관리</h2>
              <div className="actions">
                <button onClick={handleGetProfile} className="btn">
                  프로필 조회
                </button>
                <button onClick={handleSaveProfile} className="btn btn-primary">
                  프로필 저장
                </button>
              </div>
              {profileStatus && (
                <div className="profile-info">
                  <p>상태: {profileStatus.status}</p>
                  {profileStatus.nftTxHash && (
                    <p>NFT 트랜잭션: {profileStatus.nftTxHash}</p>
                  )}
                </div>
              )}
            </section>

            <section className="section">
              <h2>주문 내역</h2>
              <button onClick={handleGetOrders} className="btn">
                주문 조회
              </button>
              {orders.length > 0 && (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-item">
                      <p>주문 ID: {order.id}</p>
                      <p>상태: {order.status}</p>
                      <p>금액: {order.amount}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
