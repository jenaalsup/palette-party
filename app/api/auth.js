import { NextResponse } from 'next/server';

let isLoggedIn = false;

export async function POST(req) {
  const { action } = await req.json();
  
  if (action === 'login') {
    isLoggedIn = true;
    return NextResponse.json({ success: true, isLoggedIn });
  } else if (action === 'logout') {
    isLoggedIn = false;
    return NextResponse.json({ success: true, isLoggedIn });
  } else if (action === 'check') {
    return NextResponse.json({ isLoggedIn });
  }
  
  return NextResponse.json({ success: false }, { status: 400 });
}