import express from 'express';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import * as admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  });
}

const db = admin.firestore();

// Stripe Client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24-preview' as any,
});

// Razorpay Client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Webhook needs raw body
  app.post('/api/webhook/stripe', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      console.error(`Stripe Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (userId && plan) {
        const dailyCredits = plan === 'plus' ? 500 : plan === 'pro' ? 200 : 80;
        await db.collection('users').doc(userId).update({
          plan: plan,
          credits: dailyCredits,
          lastRenewalDate: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`User ${userId} upgraded to ${plan} via Stripe`);
      }
    }

    res.json({ received: true });
  });

  // Razorpay Webhook
  app.post('/api/webhook/razorpay', bodyParser.json(), async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-razorpay-signature'] as string;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Razorpay Webhook Signature Mismatch');
      return res.status(400).send('Invalid Signature');
    }

    const event = req.body;
    
    // Handle subscription events
    if (event.event === 'subscription.charged') {
      const subscription = event.payload.subscription.entity;
      const userId = subscription.notes?.userId;
      const plan = subscription.notes?.plan;

      if (userId && plan) {
        const dailyCredits = plan === 'plus' ? 500 : plan === 'pro' ? 200 : 80;
        await db.collection('users').doc(userId).update({
          plan: plan,
          credits: dailyCredits,
          lastRenewalDate: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`User ${userId} upgraded to ${plan} via Razorpay`);
      }
    }

    res.json({ status: 'ok' });
  });

  // FastSpring Webhook
  app.post('/api/webhook/fastspring', bodyParser.json(), async (req, res) => {
    const secret = process.env.FASTSPRING_WEBHOOK_SECRET || '';
    const signature = req.headers['x-fs-signature'] as string;

    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('base64');

      if (signature !== expectedSignature) {
        console.error('FastSpring Webhook Signature Mismatch');
        return res.status(400).send('Invalid Signature');
      }
    }

    const { events } = req.body;
    
    if (events && Array.isArray(events)) {
      for (const event of events) {
        // Handle order completed or subscription activated
        if (event.type === 'order.completed' || event.type === 'subscription.activated') {
          const data = event.data;
          const userId = data.tags?.userId;
          const plan = data.tags?.plan;

          if (userId && plan) {
            const dailyCredits = plan === 'plus' ? 500 : plan === 'pro' ? 200 : 80;
            await db.collection('users').doc(userId).update({
              plan: plan,
              credits: dailyCredits,
              lastRenewalDate: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`User ${userId} upgraded to ${plan} via FastSpring (${event.type})`);
          }
        }
      }
    }

    res.json({ status: 'ok' });
  });

  // Regular JSON parsing for other routes
  app.use(express.json());
  app.use(cors());

  // Stripe Checkout Session
  app.post('/api/create-checkout-session', async (req, res) => {
    const { userId, plan, priceId } = req.body;

    if (!userId || !plan || !priceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/pricing`,
        metadata: {
          userId,
          plan,
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe Session Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Razorpay Subscription Creation
  app.post('/api/create-razorpay-subscription', async (req, res) => {
    const { userId, plan, planId } = req.body;

    if (!userId || !plan || !planId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        total_count: 12, // 1 year
        quantity: 1,
        customer_notify: 1,
        notes: {
          userId,
          plan,
        },
      });

      res.json({ 
        subscriptionId: subscription.id,
        keyId: process.env.RAZORPAY_KEY_ID
      });
    } catch (error: any) {
      console.error('Razorpay Subscription Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
