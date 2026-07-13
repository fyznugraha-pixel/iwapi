import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return NextResponse.json(
        { status: 'error', message: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // Google Apps Script Webhook URL
    const gasUrl = "https://script.google.com/macros/s/AKfycbzZ9Ok4VZvBjKGooJcIsYcnFFU8E22L40jcbkWsSeciQ2xcw6w4VCYpzZFn0XpqI5g/exec";

    const response = await fetch(gasUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'validate',
        ticketId: ticketId
      })
    });

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Gagal terhubung ke server database' },
      { status: 500 }
    );
  }
}
