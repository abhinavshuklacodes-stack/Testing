const API_BASE = ''; // Set this if your API is hosted on another origin.
const apiUrl = path => `${API_BASE}${path}`;

document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input');
    input.type = input.type === 'password' ? 'text' : 'password';
    button.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
  });
});

const loginForm = document.querySelector('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('#login-message');
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;
    message.className = 'form-message';
    message.textContent = 'Signing in…';
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
        body: JSON.stringify({username, password})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Login failed. Check your details.');
      message.className = 'form-message success';
      message.textContent = 'Login successful. Redirecting…';
      window.location.href = 'index.html';
    } catch (error) {
      message.textContent = error.message === 'Failed to fetch'
        ? 'Login service is not connected yet. Configure POST /api/auth/login on your backend.'
        : error.message;
    }
  });

  document.querySelector('#forgot-link').addEventListener('click', async event => {
    event.preventDefault();
    const username = loginForm.username.value.trim();
    if (!username) {
      const message = document.querySelector('#login-message');
      message.textContent = 'Enter your username first, then select Forgot password.';
      loginForm.username.focus();
      return;
    }
    try {
      const response = await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
        body: JSON.stringify({username})
      });
      const data = await response.json().catch(() => ({}));
      document.querySelector('#login-message').textContent = response.ok
        ? (data.message || 'If the account exists, password reset instructions will be sent.')
        : (data.message || 'Password reset service is not configured yet.');
    } catch {
      document.querySelector('#login-message').textContent = 'Connect POST /api/auth/forgot-password to enable password recovery.';
    }
  });
}

const registerForm = document.querySelector('#register-form');
if (registerForm) {
  document.querySelector('#google-register').addEventListener('click', () => {
    // Configure Google OAuth client ID and server callback before enabling this route.
    window.location.href = apiUrl('/api/auth/google');
  });

  registerForm.addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('#register-message');
    const name = registerForm.name.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;
    const confirmPassword = registerForm.confirmPassword.value;
    message.className = 'form-message';
    if (password.length < 8) {
      message.textContent = 'Use at least 8 characters for your Orcible password.';
      return;
    }
    if (password !== confirmPassword) {
      message.textContent = 'The passwords do not match.';
      registerForm.confirmPassword.focus();
      return;
    }
    message.textContent = 'Creating your account…';
    try {
      const response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
        body: JSON.stringify({name, email, password})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Registration failed.');
      message.className = 'form-message success';
      message.textContent = 'Account created. Redirecting…';
      window.location.href = 'index.html';
    } catch (error) {
      message.textContent = error.message === 'Failed to fetch'
        ? 'Registration service is not connected yet. Configure POST /api/auth/register on your backend.'
        : error.message;
    }
  });
}
