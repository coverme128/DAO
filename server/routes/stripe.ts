import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { billingService } from '../services/billing';

const router = express.Router();

const checkoutRequestSchema = z.object({
  userId: z.string(),
});

// Lazy initialization - only create Stripe client when needed
function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }
  
  // Validate key format (should be at least 50 characters and start with sk_test_ or sk_live_)
  if (secretKey.length < 50 || (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_'))) {
    console.warn('⚠️  Invalid Stripe secret key format. Key should start with sk_test_ or sk_live_ and be at least 50 characters long.');
    return null;
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  });
}

// Create Stripe Checkout session
router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const validated = checkoutRequestSchema.parse(req.body);
    const stripe = getStripeClient();
    
    if (!stripe) {
      const secretKey = process.env.STRIPE_SECRET_KEY || '';
      let errorMessage = 'Stripe is not configured.';
      
      if (!secretKey) {
        errorMessage = 'STRIPE_SECRET_KEY is not set in .env.local';
      } else if (secretKey.length < 50 || (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_'))) {
        errorMessage = 'Invalid Stripe API key format. Please set a valid key from Stripe Dashboard.';
      }
      
      return res.status(503).json({ 
        error: 'Stripe is not configured',
        message: errorMessage,
        hint: 'Get your Stripe keys from: https://dashboard.stripe.com/apikeys',
      });
    }

    // Get user info
    const user = await billingService.getUser(validated.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get frontend URL for success/cancel redirects
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Acoda Pro',
              description: 'Unlimited voice messages and advanced features',
            },
            unit_amount: 2000, // $20.00 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: user.email || undefined,
      client_reference_id: validated.userId, // Store userId for webhook processing
      success_url: `${frontendUrl}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing?canceled=true`,
      metadata: {
        userId: validated.userId,
      },
    });

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    return res.json({ url: session.url });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('Checkout creation error:', error);
    
    // Handle Stripe authentication errors
    if (error.type === 'StripeAuthenticationError' || error.statusCode === 401) {
      return res.status(401).json({
        error: 'Invalid Stripe API key',
        message: 'The Stripe secret key in .env.local is invalid. Please check your Stripe Dashboard for the correct key.',
      });
    }

    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message || 'An error occurred while creating the payment session',
    });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in .env.local' });
  }

  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).json({ error: 'No signature' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({ error: 'Stripe webhook secret is not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature as string,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful checkout
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        
        if (userId) {
          await billingService.updateUserPlan(userId, 'PRO');
          console.log(`User ${userId} upgraded to PRO`);
        } else {
          console.warn('No userId found in checkout session');
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Handle subscription events
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

        // Try to get userId from subscription metadata
        const subUserId = subscription.metadata?.userId;
        if (subUserId) {
          await billingService.updateUserPlan(subUserId, 'PRO');
          console.log(`User ${subUserId} subscription updated to PRO`);
        } else {
          console.warn('No userId found in subscription metadata');
        }
        break;

      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const deletedUserId = deletedSubscription.metadata?.userId;
        
        if (deletedUserId) {
          await billingService.updateUserPlan(deletedUserId, 'FREE');
          console.log(`User ${deletedUserId} downgraded to FREE`);
        } else {
          console.warn('No userId found in deleted subscription metadata');
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;

