import webpush from 'web-push';

// Configure web-push with VAPID keys
// In production, these should be environment variables
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI6YrrC_VxKpQwHrZGrHugGNmCyQjLQvBSdHRAGBzTrBrw7uQcjhqq0anA',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'tUkzMpKWWBuruUGsQF_NfwSRjZfLrHQBmdev4LiCcgw'
};

webpush.setVapidDetails(
  'mailto:support@prolearning.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST(request: Request) {
  try {
    const { subscription, payload } = await request.json();

    if (!subscription || !payload) {
      return new Response(JSON.stringify({ 
        error: 'Missing subscription or payload' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate subscription format
    if (!subscription.endpoint || !subscription.keys) {
      return new Response(JSON.stringify({ 
        error: 'Invalid subscription format' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send push notification
    const notificationPayload = JSON.stringify({
      title: payload.title || 'ProLearning Notification',
      body: payload.body || 'You have a new notification',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: payload.data || {},
      actions: payload.actions || [
        {
          action: 'view',
          title: 'View',
          icon: '/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });

    await webpush.sendNotification(subscription, notificationPayload);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Push notification sent successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Push notification error:', error);
    
    // Handle specific web-push errors
    if (error.statusCode === 410) {
      // Subscription is no longer valid
      return new Response(JSON.stringify({ 
        error: 'Subscription expired',
        code: 'SUBSCRIPTION_EXPIRED'
      }), {
        status: 410,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (error.statusCode === 413) {
      // Payload too large
      return new Response(JSON.stringify({ 
        error: 'Payload too large',
        code: 'PAYLOAD_TOO_LARGE'
      }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Failed to send push notification',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
