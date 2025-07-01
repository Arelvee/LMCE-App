import { updateUserProfile } from '@/db/database';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const { userId, ...profileData } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    // Update user profile
    await updateUserProfile(userId, profileData);
    
    // Return updated user data
    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: userId,
          ...profileData
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}