import { useState, useEffect } from 'react';
import { User, LogIn, LogOut, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import './App.css';

const App = () => {
  const [clientId, setClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize Google Auth
  const initializeGoogleAuth = () => {
    if (!clientId.trim()) {
      setError('Please enter a valid Client ID');
      return;
    }

    if (!window.google) {
      setError('Google Identity Services not loaded. Please refresh the page.');
      return;
    }

    // Validate Client ID format
    if (!clientId.includes('.googleusercontent.com')) {
      setError('Client ID should end with .googleusercontent.com. Please check your Client ID.');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false
      });

      setIsInitialized(true);
      setError('');
      console.log('Google Auth initialized successfully with Client ID:', clientId.substring(0, 20) + '...');
    } catch (err) {
      setError('Failed to initialize Google Auth: ' + err.message);
      console.error('Init error:', err);
    }
  };

  // Handle credential response from Google
  const handleCredentialResponse = (response) => {
    try {
      const payload = parseJwt(response.credential);
      
      setUser({
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      });
      
      setToken(response.credential);
      setError('');
      console.log('Sign-in successful:', payload);
    } catch (err) {
      setError('Failed to process sign-in: ' + err.message);
      console.error('Credential response error:', err);
    }
  };

  // Sign in function
  const signIn = () => {
    if (!isInitialized) {
      setError('Please initialize Google Auth first');
      return;
    }

    setIsLoading(true);
    setError(''); // Clear any previous errors
    
    try {
      // First try the One Tap prompt
      window.google.accounts.id.prompt((notification) => {
        setIsLoading(false);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: render a sign-in button instead of showing error
          console.log('One Tap not displayed, using button fallback');
          renderSignInButton();
        }
      });
    } catch (err) {
      setIsLoading(false);
      setError('Sign-in failed: ' + err.message);
      console.error('Sign-in error:', err);
    }
  };

  // Render Google Sign-In button as fallback
  const renderSignInButton = () => {
    const buttonDiv = document.getElementById('google-signin-button');
    if (buttonDiv && window.google) {
      buttonDiv.innerHTML = ''; // Clear any existing content
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'outline',
        size: 'large',
        width: 250,
        text: 'signin_with',
        shape: 'rectangular'
      });
    }
  };

  // Sign out function
  const signOut = () => {
    try {
      if (window.google) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      setUser(null);
      setToken('');
      setError('');
      console.log('Sign-out successful');
    } catch (err) {
      setError('Sign-out failed: ' + err.message);
      console.error('Sign-out error:', err);
    }
  };

  // Parse JWT token
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (err) {
      throw new Error('Invalid JWT token');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8 flex items-center justify-center gap-3">
            <User className="w-8 h-8" />
            Google OAuth Authentication
          </h1>

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Setup Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700 mb-4">
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Google Cloud Console</a></li>
              <li>Create a new project or select an existing one</li>
              <li>Enable the Google Identity Services API</li>
              <li>Go to "APIs & Services" → "Credentials"</li>
              <li>Create OAuth 2.0 Client ID</li>
              <li>Add your domain to "Authorized JavaScript origins"</li>
              <li>Copy your Client ID and paste it below</li>
            </ol>
            <div className="bg-blue-100 border border-blue-300 rounded p-3">
              <p className="text-sm text-blue-800 font-semibold mb-2">Important Notes:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• For local development, add: <code className="bg-blue-200 px-1 rounded">http://localhost:5173</code></li>
                <li>• For GitHub Pages, add: <code className="bg-blue-200 px-1 rounded">https://yourusername.github.io</code></li>
                <li>• Make sure cookies are enabled in your browser</li>
                <li>• Some browsers block third-party cookies which can affect One Tap</li>
                <li>• GitHub Pages only supports HTTPS, which is required for Google OAuth</li>
              </ul>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Configuration</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your Google OAuth Client ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-500"
              />
              <button
                onClick={initializeGoogleAuth}
                disabled={!clientId.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Initialize Google Auth
              </button>
              {isInitialized && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Google Auth initialized successfully!
                </div>
              )}
            </div>
          </div>

          {/* Authentication Section */}
          {isInitialized && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Authentication</h3>
              <div className="space-y-4">
                {!user ? (
                  <div className="space-y-4">
                    <button
                      onClick={signIn}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      {isLoading ? 'Signing In...' : 'Sign In with Google (One Tap)'}
                    </button>
                    
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-3">
                        If the One Tap doesn't work, use the button below:
                      </p>
                      <div 
                        id="google-signin-button" 
                        className="flex justify-start"
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={signOut}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Error</span>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          )}

          {/* User Information */}
          {user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">User Information</h3>
              <div className="flex items-center gap-4">
                <img
                  src={user.picture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-2 border-green-300"
                />
                <div className="space-y-2">
                  <p className="text-green-700">
                    <span className="font-semibold">Name:</span> {user.name}
                  </p>
                  <p className="text-green-700">
                    <span className="font-semibold">Email:</span> {user.email}
                  </p>
                  <p className="text-green-700">
                    <span className="font-semibold">ID:</span> {user.id}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* JWT Token Display */}
          {token && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">JWT Token Information</h3>
              <div className="space-y-2">
                <p className="text-gray-700 font-semibold">Token:</p>
                <textarea
                  value={token}
                  readOnly
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none text-gray-800 placeholder-gray-500"
                />
                <p className="text-sm text-gray-600">
                  This JWT token contains your authentication information and can be used to verify your identity with backend services.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;