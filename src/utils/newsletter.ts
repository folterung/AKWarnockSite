export async function subscribeToNewsletter(email: string): Promise<void> {
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe');
    }

    console.log('Successfully subscribed!');
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
} 