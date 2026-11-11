<?php
/**
 * JWT Helper Class
 * Handles JWT token generation and validation
 */

class JWT {
    
    /**
     * Generate a JWT token
     */
    public static function generate($payload) {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];
        
        // Add standard claims
        $payload['iss'] = JWT_ISSUER;
        $payload['aud'] = JWT_AUDIENCE;
        $payload['iat'] = time();
        $payload['exp'] = time() + (JWT_EXPIRE_HOURS * 3600);
        
        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
        $signatureEncoded = self::base64UrlEncode($signature);
        
        return "$headerEncoded.$payloadEncoded.$signatureEncoded";
    }
    
    /**
     * Validate and decode a JWT token
     */
    public static function validate($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return ['valid' => false, 'error' => 'Invalid token format'];
        }
        
        list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
        
        // Verify signature
        $signature = self::base64UrlDecode($signatureEncoded);
        $expectedSignature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
        
        if (!hash_equals($expectedSignature, $signature)) {
            return ['valid' => false, 'error' => 'Invalid signature'];
        }
        
        // Decode payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
        
        if (!$payload) {
            return ['valid' => false, 'error' => 'Invalid payload'];
        }
        
        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return ['valid' => false, 'error' => 'Token expired'];
        }
        
        // Verify issuer and audience
        if (isset($payload['iss']) && $payload['iss'] !== JWT_ISSUER) {
            return ['valid' => false, 'error' => 'Invalid issuer'];
        }
        
        if (isset($payload['aud']) && $payload['aud'] !== JWT_AUDIENCE) {
            return ['valid' => false, 'error' => 'Invalid audience'];
        }
        
        return ['valid' => true, 'payload' => $payload];
    }
    
    /**
     * Generate a refresh token
     */
    public static function generateRefreshToken() {
        return bin2hex(random_bytes(64));
    }
    
    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL decode
     */
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
