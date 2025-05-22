const SetupInfo = () => {
    return (
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
    )
}

export default SetupInfo;