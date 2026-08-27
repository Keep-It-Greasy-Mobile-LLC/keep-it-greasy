import http from 'http';
import { exec } from 'child_process';

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = 'https://www.googleapis.com/auth/photoslibrary';

const CLIENT_ID = process.argv[2];
const CLIENT_SECRET = process.argv[3];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.log('\nUsage: node scripts/get-refresh-token.js <CLIENT_ID> <CLIENT_SECRET>\n');
  process.exit(1);
}

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
  `client_id=${encodeURIComponent(CLIENT_ID)}&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `response_type=code&` +
  `scope=${encodeURIComponent(SCOPE)}&` +
  `access_type=offline&` +
  `prompt=consent`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (url.pathname === '/oauth2callback') {
    const code = url.searchParams.get('code');
    
    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Authorization code not found.');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Success!</h1><p>You can close this tab and return to the console.</p>');

    server.close();

    console.log('\nExchanging code for tokens...');
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(errorText);
      }

      const tokens = await tokenResponse.json();
      console.log('\n=========================================');
      console.log('YOUR REFRESH TOKEN:');
      console.log(tokens.refresh_token);
      console.log('=========================================\n');
      console.log('Save this refresh token as GOOGLE_REFRESH_TOKEN in your GitHub Secrets.');
    } catch (err) {
      console.error('Error exchanging token:', err.message);
    }
    process.exit(0);
  }
});

server.listen(PORT, () => {
  console.log(`\nLocal server running on http://localhost:${PORT}`);
  console.log('Opening authorization page in your browser...');
  
  // Open the browser automatically based on the OS
  const command = process.platform === 'win32' ? `start ""` : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${command} "${authUrl.replace(/"/g, '\\"')}"`);
});
