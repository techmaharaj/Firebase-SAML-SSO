import { 
    SAMLAuthProvider, 
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { auth } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Starting auth initialization');
    
    // SAML provider configuration
    const provider = new SAMLAuthProvider('saml.okta');
    
    // Track auth state
    let isAuthenticating = false;
    
    // Setup login button
    const ssoButton = document.getElementById('sso-button');
    if (ssoButton) {
        ssoButton.addEventListener('click', handleLogin);
    }

    async function handleLogin(e) {
        e.preventDefault();
        if (isAuthenticating) return;

        try {
            console.log('Initiating SAML login');
            isAuthenticating = true;
            updateUI('signing-in');

            // Store auth state
            sessionStorage.setItem('loginStarted', 'true');
            sessionStorage.setItem('loginTime', Date.now().toString());
            sessionStorage.setItem('originalUrl', window.location.href);

            // Start SAML flow
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error('SAML login error:', error);
            handleError(error);
            isAuthenticating = false;
            updateUI('error');
        }
    }

    function updateUI(state) {
        const button = document.getElementById('sso-button');
        const status = document.getElementById('login-status');
        const error = document.getElementById('error-message');

        if (!button || !status || !error) return;

        switch (state) {
            case 'signing-in':
                button.disabled = true;
                button.textContent = 'Signing in...';
                status.textContent = 'Redirecting to login...';
                status.style.display = 'block';
                error.style.display = 'none';
                break;
            case 'error':
                button.disabled = false;
                button.textContent = 'Sign in with SSO';
                status.style.display = 'none';
                break;
            case 'success':
                button.style.display = 'none';
                status.textContent = 'Successfully authenticated! Redirecting...';
                error.style.display = 'none';
                break;
        }
    }

    function handleError(error) {
        console.error('Auth error:', error);
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = `Authentication Error: ${error.message}`;
            errorDiv.style.display = 'block';
        }
    }

    async function handleRedirectResult() {
        console.log('Checking for redirect result');
        
        try {
            const result = await getRedirectResult(auth);
            console.log('Redirect result:', result);

            if (result) {
                console.log('Successfully authenticated');
                const user = result.user;
                const idToken = await user.getIdToken();

                // Send token to backend
                const response = await fetch('/auth/verify-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ idToken })
                });

                if (!response.ok) {
                    throw new Error('Failed to verify token with backend');
                }

                // Clear auth state
                sessionStorage.removeItem('loginStarted');
                sessionStorage.removeItem('loginTime');

                // Redirect to profile
                window.location.href = '/profile';
            } else {
                const loginStarted = sessionStorage.getItem('loginStarted');
                const loginTime = parseInt(sessionStorage.getItem('loginTime') || '0');
                
                if (loginStarted && loginTime) {
                    const elapsedTime = Date.now() - loginTime;
                    console.log(`Time elapsed since login start: ${elapsedTime}ms`);
                    
                    if (elapsedTime > 300000) { // 5 minutes
                        console.log('Login attempt timed out');
                        sessionStorage.removeItem('loginStarted');
                        sessionStorage.removeItem('loginTime');
                        handleError(new Error('Login attempt timed out. Please try again.'));
                    }
                }
            }
        } catch (error) {
            console.error('Error handling redirect:', error);
            handleError(error);
        } finally {
            isAuthenticating = false;
        }
    }

    // Set up auth state observer
    onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed:', user ? 'logged in' : 'logged out');
        if (user) {
            console.log('User:', user.email);
            updateUI('success');
        }
    });

    // Check for redirect result on page load
    handleRedirectResult();
});