import express, { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { XMLParser } from 'fast-xml-parser';
import { checkRateLimit, recordFailedLogin, resetLoginAttempts } from '../utils/rate-limit';
import { UserRepository } from '../repositories/user.repository';
import { PmisRepository } from '../repositories/pmis.repository';
import { AuditLogger } from '../audit-logs/audit-logger';
import axios from 'axios';

const router = Router();
const userRepo = new UserRepository();
const pmisRepo = new PmisRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'sso-portal-secret-key-12345';
const oneTimeTokens = new Map<string, string>(); // authCode -> jwt

const xmlParserMiddleware = express.text({
  type: ['text/xml', 'application/xml', 'application/soap+xml']
});

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true
});

function buildSoapFault(message: string) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>${message}</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;
}

// SOAP XML Endpoint for PMIS TokenService (Simulating PMIS SOAP GetToken)
router.post('/soap/pmis/token', xmlParserMiddleware, async (req: Request, res: Response) => {
  res.set('Content-Type', 'text/xml');
  try {
    const rawXml = req.body;
    if (!rawXml) return res.status(400).send(buildSoapFault("Empty request body"));

    const jsonObj = parser.parse(rawXml);
    const getToken = jsonObj?.Envelope?.Body?.GetToken;
    const clientId = getToken?.ClientId;
    const clientSecret = getToken?.ClientSecret;

    if (!clientId || !clientSecret) {
      return res.status(400).send(buildSoapFault("Missing ClientId or ClientSecret"));
    }

    // Return mock API Access Token (JWT)
    const apiAccessToken = "mock_pmis_api_access_token_jwt_" + Date.now();
    
    const responseXml = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <GetTokenResponse xmlns="http://pmis.ieat.go.th/">
      <GetTokenResult>
        <Token>${apiAccessToken}</Token>
        <ExpiresIn>3600</ExpiresIn>
      </GetTokenResult>
    </GetTokenResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

    return res.send(responseXml);
  } catch (error) {
    console.error("[SOAP PMIS GetToken] Error:", error);
    return res.status(500).send(buildSoapFault("Internal server error"));
  }
});

// SOAP XML Endpoint for PMIS: ValidateUser (Simulating PMIS SOAP Web Service)
router.post('/soap/pmis', xmlParserMiddleware, async (req: Request, res: Response) => {
  res.set('Content-Type', 'text/xml');
  try {
    const rawXml = req.body;
    if (!rawXml) {
      return res.status(400).send(buildSoapFault("Empty request body"));
    }

    const jsonObj = parser.parse(rawXml);
    const validateUser = jsonObj?.Envelope?.Body?.ValidateUser;
    const username = validateUser?.username;

    if (!username) {
      return res.status(400).send(buildSoapFault("Missing username parameter in ValidateUser SOAP Request"));
    }

    const pmisUser = await pmisRepo.findByUsername(username);
    const exists = !!(pmisUser && pmisUser.enabled === 1);
    
    const responseXml = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ValidateUserResponse xmlns="http://pmis.ieat.go.th/">
      <ValidateUserResult>
        <exists>${exists}</exists>
        <username>${pmisUser?.username || username}</username>
        <email>${pmisUser?.email || ''}</email>
        <role_id>${pmisUser?.role_id || 0}</role_id>
        <user_type>${pmisUser?.user_type || ''}</user_type>
        <enabled>${pmisUser?.enabled || 0}</enabled>
        <status>${pmisUser?.status || 'inactive'}</status>
      </ValidateUserResult>
    </ValidateUserResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

    return res.send(responseXml);
  } catch (error) {
    console.error("[SOAP PMIS ValidateUser] Error:", error);
    return res.status(500).send(buildSoapFault("Internal server error"));
  }
});

// SOAP XML Endpoint for SSO Portal: ValidateToken (SOAP version of token verification)
router.post('/soap/sso', xmlParserMiddleware, async (req: Request, res: Response) => {
  res.set('Content-Type', 'text/xml');
  try {
    const rawXml = req.body;
    if (!rawXml) {
      return res.status(400).send(buildSoapFault("Empty request body"));
    }

    const jsonObj = parser.parse(rawXml);
    const validateToken = jsonObj?.Envelope?.Body?.ValidateToken;
    let token = validateToken?.token;
    if (!token) {
      return res.status(400).send(buildSoapFault("Missing token parameter in ValidateToken SOAP Request"));
    }

    if (oneTimeTokens.has(token)) {
      const realToken = oneTimeTokens.get(token);
      oneTimeTokens.delete(token);
      token = realToken as string;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      AuditLogger.log('SSO_SOAP_TOKEN_VALIDATION_SUCCESS', {
        username: decoded.username,
        applicationId: decoded.applicationId
      });

      const responseXml = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ValidateTokenResponse xmlns="http://sso.ieat.go.th/">
      <ValidateTokenResult>
        <valid>true</valid>
        <id>${decoded.userId}</id>
        <username>${decoded.username}</username>
        <email>${decoded.email}</email>
        <fullName>${decoded.fullName}</fullName>
        <role>${decoded.role}</role>
        <department>${decoded.department}</department>
      </ValidateTokenResult>
    </ValidateTokenResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

      return res.send(responseXml);
    } catch (jwtErr) {
      AuditLogger.log('SSO_SOAP_TOKEN_VALIDATION_FAILED', { error: jwtErr instanceof Error ? jwtErr.message : String(jwtErr) });
      const responseXml = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ValidateTokenResponse xmlns="http://sso.ieat.go.th/">
      <ValidateTokenResult>
        <valid>false</valid>
      </ValidateTokenResult>
    </ValidateTokenResponse>
  </soapenv:Body>
</soapenv:Envelope>`;
      return res.send(responseXml);
    }
  } catch (error) {
    console.error("[SOAP SSO ValidateToken] Error:", error);
    return res.status(500).send(buildSoapFault("Internal server error"));
  }
});

// 1.1 External API: PMIS Token Acquisition (REST)
router.post('/external/pmis/auth/token', async (req: Request, res: Response) => {
  const { clientId, clientSecret } = req.body;
  
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'Missing clientId or clientSecret' });
  }

  // Simulate returning a JSON Access Token
  const apiAccessToken = "mock_pmis_api_access_token_jwt_" + Date.now();
  
  return res.json({
    access_token: apiAccessToken,
    token_type: "Bearer",
    expires_in: 3600
  });
});

// 1.2 External API: PMIS Validate User (REST)
router.post('/external/pmis/validate-user', async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Missing username parameter' });
  }

  try {
    const pmisUser = await pmisRepo.findByUsername(username);
    if (pmisUser && pmisUser.enabled === 1) {
      AuditLogger.log('PMIS_EXTERNAL_VALIDATION_SUCCESS', { username, email: pmisUser.email, role_id: pmisUser.role_id });
      return res.json({
        exists: true,
        user: {
          username: pmisUser.username,
          email: pmisUser.email,
          role_id: pmisUser.role_id,
          user_type: pmisUser.user_type,
          status: pmisUser.status
        }
      });
    }

    AuditLogger.log('PMIS_EXTERNAL_VALIDATION_NOT_FOUND', { username });
    return res.json({ exists: false });
  } catch (error) {
    console.error('[PMIS External API] Error validating user:', error);
    res.status(500).json({ error: 'External service error' });
  }
});

// 2. SSO Identity Check & JIT Provisioning (SAML mock login)
router.post('/sso/mock-login', async (req: Request, res: Response) => {
  const { username, providerId, reset } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, error: 'Invalid username or password' });
  }

  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp, username)) {
    return res.status(429).json({ success: false, error: 'Too many attempts, please try again later' });
  }

  try {
    if (reset) {
      const existing = await userRepo.findByUsername(username);
      if (existing) {
        await userRepo.delete(existing.id);
        AuditLogger.log('SSO_USER_RESET_SUCCESS', { username, userId: existing.id });
        return res.json({ success: true, message: `Reset user ${username}` });
      }
      return res.json({ success: true, message: `User ${username} not in DB` });
    }

    AuditLogger.log('SSO_CHECK_USER_DB_START', { username, providerId });

    // Step 1: Check in SSO DB
    let ssoUser = await userRepo.findByUsername(username);
    let trace = [];

    if (ssoUser) {
      trace.push({ step: 'CHECK_SSO_DB', status: 'FOUND', description: 'User found in SSO database.' });
      AuditLogger.log('SSO_CHECK_USER_DB_FOUND', { username });
      
      resetLoginAttempts(clientIp, username);
      return res.json({
        success: true,
        user: ssoUser,
        trace,
        message: 'Successfully authenticated from SSO DB'
      });
    }

    // Step 2: User not found in SSO. Call REST ValidateUser on PMIS
    trace.push({ step: 'CHECK_SSO_DB', status: 'NOT_FOUND', description: 'User not found in SSO. Performing User Discovery via PMIS REST API.' });
    AuditLogger.log('SSO_USER_DISCOVERY_START', { username });

    let pmisUserInfo: any = null;
    let pmisToken = null;

    try {
      // 1. GetToken from PMIS
      const tokenUrl = 'https://pmis-uat-phase2.wisdomcloud.net/api/v1/auth/token/service';
      const tokenResponse = await axios.get(tokenUrl, {
        params: {
          client_id: '5ki7WM5zsQd4Qdx5',
          client_secret: 'NPbzqF23yRWl5SCSPxhx71Fzu0E5MnPp'
        }
      });
      pmisToken = tokenResponse.data?.access_token || tokenResponse.data?.token;

      if (!pmisToken) {
        throw new Error('Failed to retrieve token from PMIS API');
      }

      trace.push({ step: 'TOKEN_SERVICE', status: 'SUCCESS', description: 'Obtained API Access Token from target system via ClientCredentials.' });

      // 2. ValidateUser on PMIS (using GET request with query params)
      const validateUrl = 'https://pmis-uat-phase2.wisdomcloud.net/api/v1/user/validate';
      const validateResponse = await axios.get(validateUrl, {
        params: { username },
        headers: { Authorization: `Bearer ${pmisToken}` }
      });

      pmisUserInfo = validateResponse.data;
    } catch (error: any) {
      console.error('[PMIS REST API] Error:', error.message || error);
      trace.push({ step: 'USER_DISCOVERY_PMIS', status: 'ERROR', description: (error.message || 'Error communicating with PMIS REST API.') + ' Falling back to mock PMIS DB.' });
      
      const pmisUser = await pmisRepo.findByUsername(username);
      if (pmisUser && pmisUser.enabled === 1) {
        pmisUserInfo = {
          exists: true,
          username: pmisUser.username,
          email: pmisUser.email,
          role_id: pmisUser.role_id,
          user_type: pmisUser.user_type,
          status: pmisUser.status
        };
      }
    }
    
    // Check if user was successfully discovered (safely handle missing fields from real PMIS API)
    const isDiscovered = pmisUserInfo && (pmisUserInfo.exists === true || pmisUserInfo.exists === 'true') && (pmisUserInfo.status !== 'inactive');

    if (!isDiscovered) {
      trace.push({ step: 'USER_DISCOVERY_PMIS', status: 'NOT_FOUND', description: 'User not found or disabled in PMIS DB.' });
      AuditLogger.log('SSO_USER_DISCOVERY_FAILED', { username, trace, pmisResponse: pmisUserInfo });
      recordFailedLogin(clientIp, username);
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // Found in PMIS! Perform JIT Provisioning & Role Mapping
    trace.push({ step: 'USER_DISCOVERY_PMIS', status: 'FOUND', description: 'User validated in PMIS DB via REST API. Initiating JIT Provisioning.' });
    
    // Map roles based on PMIS response parameters (handling both real and mock attributes)
    const hasAdminRole = (pmisUserInfo.roles && pmisUserInfo.roles.includes('Admin')) || Number(pmisUserInfo.role_id) === 1;
    const mappedRole = hasAdminRole ? 'Admin' : 'User';
    const finalUsername = pmisUserInfo.username || username;
    
    ssoUser = {
      id: uuidv4(),
      username: finalUsername,
      email: pmisUserInfo.email || (finalUsername.includes('@') ? finalUsername : `${finalUsername}@ieat.go.th`),
      fullName: `PMIS User (${finalUsername})`,
      department: pmisUserInfo.user_type || (pmisUserInfo.roles && pmisUserInfo.roles.join(', ')) || 'PMIS Department',
      role: mappedRole,
      status: pmisUserInfo.status || 'active'
    };

    // Save to SSO DB
    await userRepo.create(ssoUser);
    trace.push({ step: 'JIT_PROVISIONING', status: 'SUCCESS', description: 'User registered in SSO and role mapped successfully.' });
    
    AuditLogger.log('SSO_JIT_PROVISIONING_SUCCESS', {
      username: ssoUser.username,
      email: ssoUser.email,
      role: ssoUser.role,
      userId: ssoUser.id
    });

    resetLoginAttempts(clientIp, username);
    return res.json({
      success: true,
      user: ssoUser,
      trace,
      pmisInfo: pmisUserInfo,
      message: 'Successfully discovered and JIT provisioned'
    });
  } catch (error) {
    console.error('[SSO Login] Error performing SSO flow:', error);
    res.status(500).json({ error: 'SSO Flow Internal Error' });
  }
});

// 3. SSO Issue Token (JWT short-lived, one-time)
const handleIssueToken = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const applicationId = req.body.applicationId || req.body.system_id;

  if (!applicationId) {
    return res.status(400).json({ error: 'Missing applicationId or system_id' });
  }

  try {
    let user: any = null;

    // Support looking up user either via explicit userId or via Bearer authorization token
    if (userId) {
      user = await userRepo.getById(userId);
    } else if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        const ssoToken = parts[1];
        try {
          const decoded = jwt.verify(ssoToken, JWT_SECRET) as any;
          user = await userRepo.getById(decoded.userId);
        } catch (err) {
          return res.status(401).json({ error: 'Invalid or expired Bearer token' });
        }
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found in SSO' });
    }

    // Generate a short-lived token (5 mins) for the deep link
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        applicationId
      },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    const authCode = uuidv4();
    oneTimeTokens.set(authCode, token);
    setTimeout(() => oneTimeTokens.delete(authCode), 5 * 60 * 1000);

    AuditLogger.log('SSO_TOKEN_ISSUED', { username: user.username, applicationId });

    // Target App PMIS URL with deep link token
    const portalUrl = process.env.PORTAL_URL || 'http://localhost:5173';
    let redirectUrl = `${portalUrl}/apps/pmis?token=${authCode}`;

    // Redirect to the real PMIS UAT system if the requested app is PMIS
    if (applicationId === 'PMIS' || applicationId === '2') {
      redirectUrl = `https://pmis-uat-phase2.wisdomcloud.net/portal-sso?token=${authCode}`;
    }

    return res.json({
      success: true,
      token: authCode,
      expires_in: 300,
      one_time_use: true,
      redirect_url: redirectUrl, // Spec parameter format
      redirectUrl: redirectUrl   // Frontend backward compatibility format
    });
  } catch (error) {
    console.error('[SSO Token] Error issuing token:', error);
    res.status(500).json({ error: 'Token issuance failed' });
  }
};

router.post('/sso/token', handleIssueToken);
router.post('/v1/auth/token', handleIssueToken);

// 4. SSO Validate Token (called by Target System e.g. PMIS)
router.post('/sso/validate-token', async (req: Request, res: Response) => {
  let { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Missing token parameter' });
  }

  if (oneTimeTokens.has(token)) {
    const realToken = oneTimeTokens.get(token);
    oneTimeTokens.delete(token);
    token = realToken as string;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    AuditLogger.log('SSO_TOKEN_VALIDATION_SUCCESS', {
      username: decoded.username,
      applicationId: decoded.applicationId
    });

    return res.json({
      valid: true,
      user: {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        fullName: decoded.fullName,
        role: decoded.role,
        department: decoded.department
      }
    });
  } catch (error) {
    AuditLogger.log('SSO_TOKEN_VALIDATION_FAILED', { error: error instanceof Error ? error.message : String(error) });
    return res.status(401).json({
      valid: false,
      error: 'Token expired, invalid or used'
    });
  }
});

// Helper function to dynamically retrieve roles from PMIS UAT or fallback
async function getRolesFromPmis(username: string): Promise<string[]> {
  try {
    // 1. GetToken from PMIS
    const tokenUrl = 'https://pmis-uat-phase2.wisdomcloud.net/api/v1/auth/token/service';
    const tokenResponse = await axios.get(tokenUrl, {
      params: {
        client_id: '5ki7WM5zsQd4Qdx5',
        client_secret: 'NPbzqF23yRWl5SCSPxhx71Fzu0E5MnPp'
      }
    });
    const pmisToken = tokenResponse.data?.access_token || tokenResponse.data?.token;

    if (pmisToken) {
      // 2. ValidateUser on PMIS
      const validateUrl = 'https://pmis-uat-phase2.wisdomcloud.net/api/v1/user/validate';
      const validateResponse = await axios.get(validateUrl, {
        params: { username },
        headers: { Authorization: `Bearer ${pmisToken}` }
      });
      if (validateResponse.data && validateResponse.data.exists) {
        if (Array.isArray(validateResponse.data.roles)) {
          return validateResponse.data.roles;
        }
      }
    }
  } catch (error: any) {
    console.error(`[getRolesFromPmis] Error fetching roles for ${username}:`, error.message || error);
  }

  // Fallback to local mock PMIS repository
  try {
    const pmisUser = await pmisRepo.findByUsername(username);
    if (pmisUser) {
      if (pmisUser.role_id === 1) {
        return ['Admin'];
      }
      return [pmisUser.user_type || 'User'];
    }
  } catch (err) {
    console.error('[getRolesFromPmis] Fallback DB error:', err);
  }

  return ['User'];
}

// Helper handler for validatetoken API supporting multiple inputs (Header, Query, Body) and GET/POST methods
const handleValidateToken = async (req: Request, res: Response) => {
  let token = req.body?.token || req.query?.token;

  if (!token && req.headers.authorization) {
    const parts = (req.headers.authorization as string).split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(400).json({
      valid: false,
      error: 'Missing token parameter'
    });
  }

  if (oneTimeTokens.has(token as string)) {
    const realToken = oneTimeTokens.get(token as string);
    oneTimeTokens.delete(token as string);
    token = realToken as string;
  }

  try {
    const decoded = jwt.verify(token as string, JWT_SECRET) as any;

    AuditLogger.log('SSO_TOKEN_VALIDATION_SUCCESS', {
      username: decoded.username,
      applicationId: decoded.applicationId,
      endpoint: req.originalUrl
    });

    // Dynamically retrieve the roles for the user from PMIS (or fallback)
    const roles = await getRolesFromPmis(decoded.username);

    return res.json({
      valid: true,
      username: decoded.username,
      roles: roles,
      user: {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        fullName: decoded.fullName,
        role: decoded.role,
        department: decoded.department
      }
    });
  } catch (error) {
    AuditLogger.log('SSO_TOKEN_VALIDATION_FAILED', {
      error: error instanceof Error ? error.message : String(error),
      endpoint: req.originalUrl
    });
    return res.status(401).json({
      valid: false,
      error: 'Token expired, invalid or used'
    });
  }
};

// Register endpoints for both /api/validatetoken and /api/sso/validatetoken
router.post('/validatetoken', handleValidateToken);
router.get('/validatetoken', handleValidateToken);
router.post('/sso/validatetoken', handleValidateToken);
router.get('/sso/validatetoken', handleValidateToken);
router.post('/v1/auth/validate', handleValidateToken);
router.get('/v1/auth/validate', handleValidateToken);

// SSO login validation and local PMIS JWT token provisioning
router.get(['/auth/sso-validate', '/v1/auth/sso-validate'], async (req: Request, res: Response) => {
  let token = req.query.token as string;
  if (!token) {
    return res.status(400).json({ error: 'Missing token parameter' });
  }

  if (oneTimeTokens.has(token)) {
    const realToken = oneTimeTokens.get(token);
    oneTimeTokens.delete(token);
    token = realToken as string;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    AuditLogger.log('SSO_VALIDATE_EXTERNAL', {
      username: decoded.username,
      applicationId: decoded.applicationId
    });

    // Request local PMIS credentials login to generate local PMIS token
    const pmisLoginUrl = 'https://pmis-uat-phase2.wisdomcloud.net/api/v1/auth/login';
    const pmisResponse = await axios.post(pmisLoginUrl, {
      email: decoded.username,
      password: 'Password1234'
    });

    return res.json(pmisResponse.data);
  } catch (error: any) {
    console.error('[SSO Validate External] Error:', error.message || (error.response && error.response.data) || error);
    return res.status(401).json({
      success: false,
      error: 'Token validation or PMIS login fallback failed'
    });
  }
});

// VTMS SSO Deep-Link generation endpoint
router.post('/v1/auth/sso/vtms', async (req: Request, res: Response) => {
  const { user } = req.body;
  if (!user) {
    return res.status(400).json({ status: 'error', message: 'User data required' });
  }

  try {
    const userDataStr = Buffer.from(user, 'base64').toString('utf8');
    const userData = JSON.parse(userDataStr);
    
    // Generate a short-lived JWT (e.g., 5 minutes) for deep linking
    const payload = {
      userId: userData.id || 999,
      username: userData.username || userData.email,
      email: userData.email,
      fullName: userData.fullName || userData.firstname + ' ' + (userData.lastname || ''),
      role: userData.role || 'User',
      department: userData.department,
      applicationId: 'VTMS',
      exp: Math.floor(Date.now() / 1000) + (5 * 60) // 5 minutes expiration
    };
    
    const token = jwt.sign(payload, JWT_SECRET);
    const redirectUrl = `https://vtms.ieat.go.th/login?token=${token}`;
    res.json({ status: 'success', redirectUrl });
  } catch (error) {
    console.error('Error generating VTMS SSO token:', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate SSO token' });
  }
});

export default router;
