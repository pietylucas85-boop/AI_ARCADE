
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();
const db = admin.firestore();

// --- 1. SECURE GEMINI PROXY ---
// Keeps API Key on server side.
export const secureGenerateContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError('internal', 'API Key not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const { model, prompt, tools } = data;

  try {
    // Basic validation to prevent abuse
    if (JSON.stringify(prompt).length > 10000) {
        throw new functions.https.HttpsError('invalid-argument', 'Payload too large.');
    }

    const config: any = {};
    if (tools) config.tools = tools;
    
    // For Grounding/Search, we typically use gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: prompt,
      config
    });

    return {
      text: response.text,
      // We don't return raw grounding metadata to client to save bandwidth unless needed
    };

  } catch (error: any) {
    console.error("Gemini API Error", error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});


// --- 2. PRICE DROP MONITOR (Scheduled Job) ---
// Runs every 24 hours to check watchlist items
export const checkPriceDrops = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    const usersSnapshot = await db.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
        const watchlistSnapshot = await userDoc.ref.collection('watchlist').get();
        if (watchlistSnapshot.empty) continue;

        const itemsToCheck = watchlistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Logic: Group items by search term and re-query Gemini/APIs to see if lower price exists
        // For demonstration, we simulate finding a lower price for 1 random item
        
        if (itemsToCheck.length > 0) {
            const randomItem = itemsToCheck[0]; // simplistic
            // In real app: Fetch current price from source URL
            
            // Send FCM Notification
            const fcmToken = userDoc.data().fcmToken;
            if (fcmToken) {
                await admin.messaging().send({
                    token: fcmToken,
                    notification: {
                        title: "Price Drop Alert! 📉",
                        body: `An item in your watchlist has dropped in price!`
                    },
                    data: { itemId: randomItem.id }
                });
            }
        }
    }
    return null;
});
