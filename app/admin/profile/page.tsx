'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { UserInfo } from '@/lib/api/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR');
}

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await authApi.getUserInfo();
        if (res.data) setUserInfo(res.data);
        else setError('사용자 정보를 불러오지 못했습니다.');
      } catch {
        setError('사용자 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex items-center justify-center h-64">
        <p className="text-text-light">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text">프로필</h1>
        <p className="text-text-light text-sm mt-1">계정 정보를 확인합니다</p>
      </div>

      {error && (
        <div role="alert" className="px-4 py-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">
          {error}
        </div>
      )}

      {/* Profile card */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Image
              src="/profile.png"
              alt="profile"
              width={80}
              height={80}
              className="rounded-full object-cover ring-4 ring-primary/20"
            />
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-success rounded-full ring-2 ring-card" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text">{userInfo?.username ?? '-'}</h2>
            <p className="text-text-light text-sm mt-0.5">{userInfo?.userId ?? '-'}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
              {userInfo?.grant ?? 'ADMIN'}
            </span>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-base font-semibold text-text mb-4">계정 정보</h3>
        <dl className="divide-y divide-border">
          <div className="flex items-center justify-between py-3">
            <dt className="text-sm text-text-light">사용자 ID</dt>
            <dd className="text-sm text-text font-medium">{userInfo?.userId ?? '-'}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-sm text-text-light">이름</dt>
            <dd className="text-sm text-text font-medium">{userInfo?.username ?? '-'}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-sm text-text-light">권한</dt>
            <dd className="text-sm text-text font-medium">{userInfo?.grant ?? '-'}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-sm text-text-light">가입일</dt>
            <dd className="text-sm text-text font-medium">
              {userInfo?.inpDttm ? formatDate(userInfo.inpDttm) : '-'}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-sm text-text-light">마지막 수정</dt>
            <dd className="text-sm text-text font-medium">
              {userInfo?.updDttm ? formatDate(userInfo.updDttm) : '-'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Quick actions */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-base font-semibold text-text mb-4">빠른 설정</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            계정 설정
          </Link>
        </div>
      </div>
    </div>
  );
}
