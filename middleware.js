import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // /api/auth/callback/keycloak への直接アクセスで state がない場合はホームにリダイレクト
  // これは AIA 完了後の「アプリケーションに戻る」リンクからのアクセスを処理する
  if (pathname === '/api/auth/callback/keycloak') {
    const hasState = searchParams.has('state');
    const hasCode = searchParams.has('code');

    // state がない、または code がない場合はホームにリダイレクト
    // refresh=true を付けて、アプリ側で再認証を促す
    if (!hasState || !hasCode) {
      return NextResponse.redirect(new URL('/?refresh=true', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/callback/:provider*'],
};
