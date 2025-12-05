# GitHub OAuth Setup for Cashlytics Backup

This guide will help you set up GitHub OAuth authentication for the Cashlytics backup feature.

## Step 1: Create a GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the following information:

   - **Application name**: `Cashlytics Backup`
   - **Homepage URL**: `https://your-username.github.io/cashlytics-web-app`
   - **Application description**: `Personal finance tracker with GitHub backup`
   - **Authorization callback URL**: `https://your-username.github.io/cashlytics-web-app/auth/callback`

4. Click "Register application"
5. Note down your **Client ID** and **Client Secret**

## Step 2: Configure the Application

1. Open `index.html` and find the `GitHubBackupManager` class
2. Replace `'your-github-oauth-app-client-id'` with your actual Client ID from step 1
3. For security, the Client Secret should be handled server-side, but for a client-side app like this, we'll use the GitHub Personal Access Token approach instead

## Step 3: Alternative Approach - Personal Access Token (Recommended)

For a simpler setup without OAuth complexity:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Create a new token with the following permissions:
   - Repository access: Selected repositories (or create new private repositories)
   - Permissions: Contents (write), Metadata (read), Pull requests (write)
3. Copy the token and store it securely

### Update the code to use Personal Access Token:

Replace the OAuth login methods in the `GitHubBackupManager` class with a simple token input:

```javascript
async loginWithToken() {
    const token = prompt('Enter your GitHub Personal Access Token:');
    if (!token) return;

    try {
        // Verify token by getting user info
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Invalid token');
        }

        const user = await response.json();

        this.auth = {
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                login: user.login,
                avatar_url: user.avatar_url
            },
            authenticated_at: new Date().toISOString()
        };

        localStorage.setItem('cashlytics_github_auth', JSON.stringify(this.auth));
        this.updateLoginButton();
        await this.ensureRepository();
        showSuccess('GitHub connected successfully!');

    } catch (error) {
        console.error('Token verification failed:', error);
        showError('Invalid GitHub token. Please check and try again.');
    }
}
```

## Security Considerations

1. **Personal Access Tokens** are simpler but require user to manage them manually
2. **OAuth Apps** provide better user experience but require server-side token exchange
3. For maximum security, consider implementing a backend service to handle OAuth flow
4. Never commit tokens or secrets to your repository
5. Use environment variables or secure configuration for sensitive data

## Testing

1. After setup, test the login flow
2. Verify that a private repository named `cashlytics-backup` is created
3. Test backup functionality
4. Check that backup files appear in the repository

## Troubleshooting

- **"Invalid client_id"**: Check your OAuth app Client ID
- **"Redirect URI mismatch"**: Ensure callback URL matches exactly
- **"API rate limiting"**: GitHub has API limits; authenticated requests have higher limits
- **"Repository creation failed"**: Check token permissions include repository creation

## Repository Structure

The backup repository will contain:

- `README.md` - Information about the backup
- `latest-backup.json` - Most recent backup (always up to date)
- `backup-YYYY-MM-DDTHH-mm-ss.json` - Timestamped backups

## Data Format

Backup files contain:

```json
{
  "books": [...],
  "transactions": [...],
  "transactionTypes": [...],
  "paymentModes": [...],
  "settings": {...},
  "metadata": {
    "exportDate": "2024-12-05T10:30:00.000Z",
    "version": "2.1",
    "type": "github-backup",
    "userAgent": "...",
    "appVersion": "2.1"
  }
}
```
