import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_TOKEN = process.env.GOOGLE_ID_TOKEN;
const client = new OAuth2Client(CLIENT_ID);

async function verifyGoogleToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      throw new Error("Email not verified by Google");
    }

    console.log(payload)

    // ✓ User is verified
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub, // Unique Google user ID
    };
  } catch (err) {
    console.error("❌ Invalid ID Token:", err.message);
    throw err;
  }
}

verifyGoogleToken(CLIENT_TOKEN)
  .then(user => {
    console.log("✓ Verified user:", user);
  })
  .catch(err => {
    console.error("❌ Verification failed:", err.message);
  });

