const jwt = require('jsonwebtoken');

class AuthService {
    // Extract user ID from JWT token (for production auth integration)
    extractUserFromToken(request) {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new Error('No valid authorization header');
            }

            const token = authHeader.substring(7);
            // For demo purposes, we'll decode without verification
            // In production, verify with your auth provider's public key
            const decoded = jwt.decode(token);
            return decoded.sub || decoded.user_id || decoded.id;
        } catch (error) {
            throw new Error('Invalid authentication token');
        }
    }

    // Middleware to protect routes
    requireAuth(request) {
        try {
            return this.extractUserFromToken(request);
        } catch (error) {
            throw new Error('Authentication required');
        }
    }
}

module.exports = new AuthService();