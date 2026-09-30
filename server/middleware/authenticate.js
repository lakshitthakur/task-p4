const { getAuth } = require('firebase-admin/auth');

async function authenticate(req, res, next) {
    try {
        const authorizationHeader =
            req.headers.authorization;

        if (!authorizationHeader) {
            return res.status(401).json({
                message: 'Authentication required.'
            });
        }

        if (!authorizationHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Invalid authentication format.'
            });
        }

        const idToken =
            authorizationHeader.split('Bearer ')[1];

        if (!idToken) {
            return res.status(401).json({
                message: 'Authentication token is missing.'
            });
        }

        const decodedToken =
            await getAuth().verifyIdToken(idToken);

        req.user = decodedToken;

        next();

    } catch (error) {
        console.error(
            'Authentication middleware error:',
            error
        );

        if (
            error.code === 'auth/id-token-expired' ||
            error.code === 'auth/invalid-id-token' ||
            error.code === 'auth/argument-error'
        ) {
            return res.status(401).json({
                message:
                    'Your login session is invalid or expired. Please log in again.'
            });
        }

        return res.status(401).json({
            message: 'Authentication failed.'
        });
    }
}

module.exports = authenticate;