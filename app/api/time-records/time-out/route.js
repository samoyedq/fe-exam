import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { employeeId, date, timeOut } = await request.json();
    
    // Read the database file
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Find the record for today
    const recordIndex = dbData.timeRecords.findIndex(
      record => record.employeeId === employeeId && record.date === date
    );
    
    if (recordIndex === -1) {
      return NextResponse.json(
        { message: 'No time in record found for today' },
        { status: 400 }
      );
    }
    
    if (dbData.timeRecords[recordIndex].timeOut) {
      return NextResponse.json(
        { message: 'Time out already recorded for today' },
        { status: 400 }
      );
    }
    
    // Update the record
    dbData.timeRecords[recordIndex].timeOut = timeOut;
    dbData.timeRecords[recordIndex].status = 'Present';
    
    // Write back to database
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
    
    return NextResponse.json({ record: dbData.timeRecords[recordIndex] });
  } catch (error) {
    console.error('Error recording time out:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
