import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    const user = dbData.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    

    const employee = dbData.employees.find(emp => emp.userId === user.id);
    
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      employee: employee
    };
    
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
