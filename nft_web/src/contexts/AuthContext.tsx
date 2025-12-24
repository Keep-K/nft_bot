import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { SiweMessage } from 'siwe';
import { api } from '../config/api';

interface User {
  id: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  connectWallet: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // 토큰이 있으면 사용자 정보 확인
      // 실제로는 토큰에서 사용자 정보를 추출하거나 API로 확인
      setUser({ id: '', address: '' });
    }
    setLoading(false);
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask를 설치해주세요!');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      
      setSigner(signer);
      setIsConnected(true);
    } catch (error: any) {
      console.error('지갑 연결 실패:', error);
      alert('지갑 연결에 실패했습니다.');
    }
  };

  const signIn = async () => {
    if (!signer) {
      await connectWallet();
      return;
    }

    try {
      // 1. Nonce 요청
      const address = await signer.getAddress();
      const nonceRes = await api.get<{ nonce: string; expiresAt: string }>(
        `/auth/nonce?address=${address}`
      );

      if (!nonceRes.ok || !nonceRes.nonce) {
        throw new Error(nonceRes.error || 'Nonce 요청 실패');
      }

      // 2. SIWE 메시지 생성
      const domain = window.location.host;
      const origin = window.location.origin;
      const chainId = 97; // BSC Testnet

      const message = new SiweMessage({
        domain,
        address,
        statement: 'NFT Bot에 로그인합니다.',
        uri: origin,
        version: '1',
        chainId,
        nonce: nonceRes.nonce,
      });

      const messageToSign = message.prepareMessage();

      // 3. 서명
      const signature = await signer.signMessage(messageToSign);

      // 4. 검증 요청
      const verifyRes = await api.post<{ token: string; user: User }>('/auth/verify', {
        address,
        message: messageToSign,
        signature,
      });

      if (!verifyRes.ok || !verifyRes.token) {
        throw new Error(verifyRes.error || '인증 실패');
      }

      // 5. 토큰 저장 및 사용자 정보 설정
      api.setToken(verifyRes.token);
      setUser(verifyRes.user);
    } catch (error: any) {
      console.error('로그인 실패:', error);
      alert(error.message || '로그인에 실패했습니다.');
    }
  };

  const signOut = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
    api.setToken(null);
    setUser(null);
    setIsConnected(false);
    setSigner(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isConnected,
        isAuthenticated: !!user,
        connectWallet,
        signIn,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ethers 타입 확장
declare global {
  interface Window {
    ethereum?: any;
  }
}

