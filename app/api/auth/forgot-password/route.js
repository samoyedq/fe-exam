import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { email } = await request.json();

    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
 
    const user = dbData.users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Email address not found in our records' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Password reset instructions have been sent to your email.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
