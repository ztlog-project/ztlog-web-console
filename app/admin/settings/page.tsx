'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { authApi } from '@/lib/api/auth';
import { AuthExpiredError } from '@/lib/api/client';

export default function SettingsPage() {
  const { logout } = useAuth();
  const router = useRouter();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Withdraw state
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawConfirmText, setWithdrawConfirmText] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('모든 항목을 입력해 주세요.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setPasswordLoading(true);
    try {
      // TODO: 비밀번호 변경 API 연동 필요 (예: PUT /v1/user/password)
      await new Promise((resolve) => setTimeout(resolve, 600));
      setPasswordSuccess('비밀번호가 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordError('비밀번호 변경에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleWithdraw() {
    setWithdrawError('');
    setWithdrawLoading(true);
    try {
      await authApi.withdraw();
      logout();
    } catch (e) {
      if (e instanceof AuthExpiredError) {
        logout();
      } else {
        setWithdrawError('회원 탈퇴에 실패했습니다. 다시 시도해 주세요.');
        setWithdrawLoading(false);
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text">설정</h1>
        <p className="text-text-light text-sm mt-1">계정 및 보안 설정을 관리합니다</p>
      </div>

      {/* Password change */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-base font-semibold text-text mb-1">비밀번호 변경</h3>
        <p className="text-text-light text-sm mb-5">보안을 위해 주기적으로 비밀번호를 변경하세요</p>

        {passwordError && (
          <div role="alert" className="mb-4 px-4 py-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div role="status" className="mb-4 px-4 py-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요 (8자 이상)"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호를 다시 입력하세요"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </form>
      </div>

      {/* Session info */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-base font-semibold text-text mb-1">세션 관리</h3>
        <p className="text-text-light text-sm mb-5">현재 로그인된 세션을 관리합니다</p>
        <div className="flex items-center justify-between p-4 bg-bg rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text">현재 세션</p>
              <p className="text-xs text-text-light mt-0.5">현재 기기에서 로그인됨</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-success font-medium">
            <span className="w-1.5 h-1.5 bg-success rounded-full" />
            활성
          </span>
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-text-light hover:text-text transition-colors underline underline-offset-2"
          >
            모든 기기에서 로그아웃
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card rounded-lg shadow-sm border border-danger/30 p-6">
        <h3 className="text-base font-semibold text-danger mb-1">위험 구역</h3>
        <p className="text-text-light text-sm mb-5">아래 작업은 되돌릴 수 없습니다. 신중하게 진행하세요.</p>

        {!showWithdrawConfirm ? (
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="text-sm font-medium text-text">계정 탈퇴</p>
              <p className="text-xs text-text-light mt-0.5">계정 및 모든 데이터가 영구적으로 삭제됩니다</p>
            </div>
            <button
              onClick={() => setShowWithdrawConfirm(true)}
              className="px-4 py-2 border border-danger text-danger rounded-lg text-sm font-medium hover:bg-danger hover:text-white transition-colors"
            >
              탈퇴하기
            </button>
          </div>
        ) : (
          <div className="p-4 border border-danger/50 rounded-lg bg-danger/5">
            <p className="text-sm font-medium text-text mb-3">
              정말로 탈퇴하시겠습니까? 확인을 위해 아래에{' '}
              <span className="font-bold text-danger">탈퇴합니다</span>를 입력하세요.
            </p>
            {withdrawError && (
              <div role="alert" className="mb-3 px-3 py-2 bg-danger/10 border border-danger/20 rounded text-xs text-danger">
                {withdrawError}
              </div>
            )}
            <input
              type="text"
              value={withdrawConfirmText}
              onChange={(e) => setWithdrawConfirmText(e.target.value)}
              placeholder="탈퇴합니다"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={handleWithdraw}
                disabled={withdrawConfirmText !== '탈퇴합니다' || withdrawLoading}
                className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {withdrawLoading ? '처리 중...' : '탈퇴 확인'}
              </button>
              <button
                onClick={() => {
                  setShowWithdrawConfirm(false);
                  setWithdrawConfirmText('');
                  setWithdrawError('');
                }}
                className="px-4 py-2 border border-border text-text rounded-lg text-sm font-medium hover:bg-bg transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
