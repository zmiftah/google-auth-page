
import { OAuth2Client } from 'google-auth-library';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
  });

  console.log('🔐 Open this URL in your browser to authenticate:');
  console.log(authUrl);

  rl.question('\n📥 Paste the code here: ', async (code) => {
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      const idToken = tokens.id_token;
      console.log('\n✓ Your Google ID Token (JWT):\n');
      console.log(idToken);
    } catch (err) {
      console.error('❌ Error retrieving token:', err);
    } finally {
      rl.close();
    }
  });
}

main();
