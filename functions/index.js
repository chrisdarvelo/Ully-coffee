const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { initializeApp, getApps } = require('firebase-admin/app');

if (!getApps().length) initializeApp();

const claudeApiKey = defineSecret('CLAUDE_API_KEY');

/**
 * Ully AI — Firebase Cloud Function that proxies requests to the Claude API.
 * The API key is stored in Firebase Secret Manager and never exposed to the client.
 * Requires the caller to be authenticated via Firebase Auth.
 */
exports.chatWithUlly = onCall(
  { secrets: [claudeApiKey], timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in to use Ully.');
    }

    const { messages, systemPrompt, maxTokens = 1024 } = request.data;

    if (!messages || !Array.isArray(messages)) {
      throw new HttpsError('invalid-argument', 'messages must be an array.');
    }

    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages,
    };
    if (systemPrompt) body.system = systemPrompt;

    let response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey.value(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new HttpsError('unavailable', 'Could not reach Claude API. Check your connection.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new HttpsError('internal', `Claude API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    if (!data?.content?.[0]?.text) {
      throw new HttpsError('internal', 'Unexpected response from Claude API.');
    }

    return { text: data.content[0].text };
  }
);

/**
 * wipeUserData — Deletes all Firestore documents belonging to the calling user.
 * Called by the client immediately before deleting the Firebase Auth account.
 * Only the authenticated user can trigger deletion of their own data.
 */
exports.wipeUserData = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in to delete account.');
  }

  const uid = request.auth.uid;
  const db = getFirestore();

  // Firestore batch deletes are capped at 500 ops — chunk to stay within the limit.
  const deleteInBatches = async (docs) => {
    const BATCH_SIZE = 500;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = db.batch();
      docs.slice(i, i + BATCH_SIZE).forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  };

  const collections = ['recipes', 'cafes', 'profiles'];
  const deletePromises = collections.map(async (col) => {
    const snap = await db.collection(col).where('userId', '==', uid).get();
    if (!snap.empty) await deleteInBatches(snap.docs);
  });

  // Also delete the profile document keyed directly by uid
  deletePromises.push(db.collection('profiles').doc(uid).delete().catch(() => {}));

  // Delete user's Storage folder
  try {
    const bucket = getStorage().bucket();
    await bucket.deleteFiles({ prefix: `users/${uid}/` });
  } catch (_) {
    // Storage folder may not exist — not an error
  }

  await Promise.all(deletePromises);
  return { success: true };
});
