//hris time in route
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { employeeId, date, timeIn } = await request.json();
    
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    const existingRecord = dbData.timeRecords.find(
      record => record.employeeId === employeeId && record.date === date
    );
    
    if (existingRecord) {
      return NextResponse.json(
        { message: 'Time in already recorded for today', existingRecord },
        { status: 400 }
      );
    }
    
  
    const newId = dbData.timeRecords.length > 0 
      ? Math.max(...dbData.timeRecords.map(r => r.id)) + 1 
      : 1;

    const newRecord = {
      id: newId,
      employeeId,
      date,
      timeIn,
      timeOut: null,
      status: 'Time In'
    };
    
    dbData.timeRecords.push(newRecord);
    
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
    
    return NextResponse.json({ record: newRecord });
  } catch (error) {
    console.error('Error recording time in:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
