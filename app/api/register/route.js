// app/api/register/route.js
import { createUser } from '@/db/database';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const userData = await request.json();
    
    // Validate required fields
    const requiredFields = ['email', 'username', 'password', 'firstName', 'lastName'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Create user in database
    const userId = await createUser(userData);
    
    return NextResponse.json(
      { success: true, userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error.message);
    
    let status = 500;
    let errorMessage = 'Internal server error';
    
    if (error.message.includes('already exists')) {
      status = 409;
      errorMessage = error.message;
    } else if (error.message === 'Failed to create user') {
      status = 400;
      errorMessage = 'Invalid user data';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}