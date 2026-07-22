import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbzZ9Ok4VZvBjKGooJcIsYcnFFU8E22L40jcbkWsSeciQ2xcw6w4VCYpzZFn0XpqI5g/exec";

    const response = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'getParticipants' }),
      cache: 'no-store'
    });

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
