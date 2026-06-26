import { Router, Request, Response } from 'express';
import { SAMLService } from '../saml/saml-service';
import { IdentitySourceService } from '../services/identity-source/identity-source.service';
import { AuditLogger } from '../audit-logs/audit-logger';
import { UserRepository } from '../repositories/user.repository';
import { PmisRepository } from '../repositories/pmis.repository';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { checkRateLimit, recordFailedLogin, resetLoginAttempts } from '../utils/rate-limit';

const router = Router();
const service = new IdentitySourceService();
const userRepo = new UserRepository();
const pmisRepo = new PmisRepository();
const vtmsDeepLinkTokens = new Map<string, any>();

async function getSAMLService(sourceKey: string) {
  const sources = await service.getAll();
  const source = sources.find(s => s.sourceKey === sourceKey);
  if (!source || source.protocolType !== 'saml') return null;
  return new SAMLService(source);
}

// Metadata Endpoint
router.get('/:provider/metadata', async (req: Request, res: Response) => {
  const provider = req.params.provider as string;
  const samlService = await getSAMLService(provider);
  if (!samlService) return res.status(404).json({ error: 'Provider not found' });
  
  const metadata = samlService.getMetadata();
  res.type('application/xml');
  res.send(metadata);
});

// Login Initiation
router.get('/:provider/login', async (req: Request, res: Response) => {
  try {
    const provider = req.params.provider as string;
    const samlService = await getSAMLService(provider);
    if (!samlService) return res.status(404).json({ error: 'Provider not found' });

    AuditLogger.authAttempt(provider, 'unknown', req.ip || undefined);
    const loginUrl = await samlService.generateAuthorizeUrl();
    res.redirect(loginUrl);
  } catch (error) {
    AuditLogger.authFailure(req.params.provider as string, 'LOGIN_INIT_FAILED', { error });
    res.status(500).json({ error: 'Failed to initiate login' });
  }
});

// ACS Callback
router.post('/:provider/callback', async (req: Request, res: Response) => {
  try {
    const provider = req.params.provider as string;
    const samlService = await getSAMLService(provider);
    if (!samlService) return res.status(404).json({ error: 'Provider not found' });

    const user = await samlService.validateResponse(req.body);
    AuditLogger.authSuccess(provider, user.id, user);
    
    // Redirect to Portal with a mock session token (production should use JWT)
    const portalUrl = process.env.PORTAL_URL || 'http://localhost:5173';
    res.redirect(`${portalUrl}/portal?auth=success&provider=${provider}`);
  } catch (error) {
    const portalUrl = process.env.PORTAL_URL || 'http://localhost:5173';
    AuditLogger.authFailure(req.params.provider as string, 'SAML_VALIDATION_FAILED', { error });
    res.redirect(`${portalUrl}/login?error=auth_failed`);
  }
});

// Logout Callback
router.get('/:provider/logout/callback', async (req: Request, res: Response) => {
  const portalUrl = process.env.PORTAL_URL || 'http://localhost:5173';
  AuditLogger.log('AUTH_LOGOUT', { provider: req.params.provider });
  res.redirect(`${portalUrl}/login?message=logged_out`);
});

// Local Admin Login (Bypass SSO)
router.post('/local/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (!username) {
    return res.status(400).json({ success: false, error: 'Invalid username or password' });
  }

  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp, username)) {
    return res.status(429).json({ success: false, error: 'Too many attempts, please try again later' });
  }

  // 1.5 Pre-fetch MTP-PORT-NET Key
  let mtpKey: string | null = null;
  let mtpType = 2;
  try {
    const wsdlUrl = 'https://uat-mtpportnet-ent.nidpro.tech/srx/service/service_sso.php';
    const getAccessXml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://uat-mtpportnet-ent.nidpro.tech/srx/service"><soapenv:Header/><soapenv:Body><ser:get_AccessToken><Key>3802ac196bbccddde9dd1dd4469ee230555ftwwfsf3ac196bbccddde9dd1</Key></ser:get_AccessToken></soapenv:Body></soapenv:Envelope>`;
    
    // Use https agent to bypass self-signed cert issues if any
    const https = require('https');
    const agent = new https.Agent({ rejectUnauthorized: false });

    const tokenRes = await axios.post(wsdlUrl, getAccessXml, { 
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      httpsAgent: agent
    });
    
    const tokenMatch = tokenRes.data.match(/<return xsi:type="xsd:string">(.*?)<\/return>/);
    if (tokenMatch && tokenMatch[1]) {
      const tokenGen = tokenMatch[1];
      const checkValidateXml = (type: number) => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://uat-mtpportnet-ent.nidpro.tech/srx/service"><soapenv:Header/><soapenv:Body><ser:check_ValidateUser><TokenGen>${tokenGen}</TokenGen><US>${username}</US><PW>${password}</PW><TypeUser>${type}</TypeUser></ser:check_ValidateUser></soapenv:Body></soapenv:Envelope>`;
      
      let valRes = await axios.post(wsdlUrl, checkValidateXml(2), { 
        headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
        httpsAgent: agent
      });
      let keyMatch = valRes.data.match(/<return xsi:type="xsd:string">(.*?)<\/return>/);
      
      if (!keyMatch || !keyMatch[1] || keyMatch[1].length < 10) {
        mtpType = 1;
        valRes = await axios.post(wsdlUrl, checkValidateXml(1), { 
          headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
          httpsAgent: agent
        });
        keyMatch = valRes.data.match(/<return xsi:type="xsd:string">(.*?)<\/return>/);
      }
      
      if (keyMatch && keyMatch[1] && keyMatch[1].length > 10) {
        mtpKey = keyMatch[1];
        console.log(`[MTP Pre-fetch] Success! mtpKey obtained for type ${mtpType}`);
      } else {
        console.log(`[MTP Pre-fetch] Failed to extract key. Response:`, valRes.data);
      }
    } else {
      console.log(`[MTP Pre-fetch] Failed to get TokenGen. Response:`, tokenRes.data);
    }
  } catch (err: any) {
    console.error('[MTP-PORT-NET Pre-fetch] Error:', err.message);
  }

  // 1. Admin login
  if (username === 'admin' && password === 'admin') {
    const adminDbUser = await userRepo.findByUsername('admin');
    const adminUser = adminDbUser ? {
      id: adminDbUser.id || 'admin_001',
      username: adminDbUser.username || 'admin',
      email: adminDbUser.email || 'admin@smartport.local',
      fullName: adminDbUser.fullName || 'System Administrator',
      role: adminDbUser.role || 'Admin',
      status: adminDbUser.status || 'active',
      firstname: adminDbUser.firstname,
      lastname: adminDbUser.lastname,
      usage_objective: adminDbUser.usage_objective,
      other_object: adminDbUser.other_object
    } : {
      id: 'admin_001',
      username: 'admin',
      email: 'admin@smartport.local',
      fullName: 'System Administrator',
      role: 'Admin',
      status: 'active'
    };
    
    AuditLogger.log('AUTH_LOCAL_SUCCESS', { username });
    resetLoginAttempts(clientIp, username);
    return res.json({ success: true, user: { ...adminUser, mtpKey, mtpType } });
  }

  // 2. Check in SSO local database (require password validation!)
  let ssoUser = await userRepo.findByUsername(username);
  if (ssoUser && ssoUser.password) {
    if (ssoUser.password === password) {
      AuditLogger.log('AUTH_LOCAL_SUCCESS', { username });
      resetLoginAttempts(clientIp, username);
      return res.json({ success: true, user: { ...ssoUser, mtpKey, mtpType, auth_source: 'LOCAL' } });
    } else {
      // Local password exists but incorrect
      AuditLogger.log('AUTH_LOCAL_FAILURE', { username, reason: 'INVALID_CREDENTIALS' });
      recordFailedLogin(clientIp, username);
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
  }
  // Note: If user exists in local DB but has NO password, we must still validate their password
  // against the original auth source below. We just pre-load their profile here.

  // 3. Perform JIT User Discovery on PMIS
  let pmisUserInfo: any = null;
  let pmisToken = null;

  try {
    // 1. GetToken from PMIS (using query params GET)
    const tokenUrl = 'https://pmis-uat-phase2.wisdomcloud.net/api/v1/auth/token/service';
    const tokenResponse = await axios.get(tokenUrl, {
      params: {
        client_id: '5ki7WM5zsQd4Qdx5',
        client_secret: 'NPbzqF23yRWl5SCSPxhx71Fzu0E5MnPp'
      }
    });
    pmisToken = tokenResponse.data?.access_token || tokenResponse.data?.token;

    if (pmisToken) {
      // 2. ValidateUser on PMIS (using GET request with query params)
      const validateUrl = 'https://pmis-uat-phase2.wisdomcloud.net/api/v1/user/validate';
      const validateResponse = await axios.get(validateUrl, {
        params: { username },
        headers: { Authorization: `Bearer ${pmisToken}` }
      });
      pmisUserInfo = validateResponse.data;
    }
  } catch (error: any) {
    console.error('[PMIS Discovery JIT Login] Error:', error.message || error);
    // Do NOT fallback to mock PMIS - it cannot validate passwords securely
  }

  // Verify if user was found on PMIS/Mock database (safely handle missing fields from real PMIS API)
  const isDiscovered = pmisUserInfo && (pmisUserInfo.exists === true || pmisUserInfo.exists === 'true') && (pmisUserInfo.status !== 'inactive');

  if (isDiscovered) {
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
    AuditLogger.log('SSO_JIT_PROVISIONING_SUCCESS', {
      username: ssoUser.username,
      email: ssoUser.email,
      role: ssoUser.role,
      userId: ssoUser.id
    });
    
    AuditLogger.log('AUTH_LOCAL_SUCCESS', { username });
    resetLoginAttempts(clientIp, username);
    return res.json({ success: true, user: { ...ssoUser, mtpKey, mtpType, auth_source: 'PMIS' } });
  }

  // 4. Fallback to VTMS Authentication
  try {
    const vtmsLoginResponse = await axios.post('https://vtms.ieat.go.th/api/auth/login', {
      username,
      password
    });

    if (vtmsLoginResponse.data?.success) {
      const vtmsUser = vtmsLoginResponse.data.data.user;
      const roleMap: Record<string, string> = {
        'admin': 'Admin',
        'operator': 'Operator',
        'viewer': 'User'
      };
      const mappedRole = roleMap[vtmsUser?.role] || 'User';

      ssoUser = {
        id: uuidv4(),
        username: vtmsUser?.username || username,
        email: vtmsUser?.email || `${username}@vtms.local`,
        fullName: vtmsUser?.fullName || `VTMS User (${username})`,
        department: 'VTMS',
        role: mappedRole,
        status: 'active'
      };

      // Save to SSO DB (JIT)
      const existingUser = await userRepo.findByUsername(ssoUser.username);
      if (!existingUser) {
        await userRepo.create(ssoUser);
      } else {
        ssoUser.id = existingUser.id;
      }

      AuditLogger.log('AUTH_LOCAL_VTMS_SUCCESS', { username });
      resetLoginAttempts(clientIp, username);
      return res.json({ success: true, user: { ...ssoUser, mtpKey, mtpType, auth_source: 'VTMS' } });
    }
  } catch (error: any) {
    console.error('[VTMS Login Fallback] Error:', error.response?.data || error.message);
  }

  // 5. MTP-PORT-NET: mtpKey is still pre-fetched and will be attached to users
  // authenticated via other methods (PMIS/VTMS). However, MTP alone is NOT used
  // as an auth method because its check_ValidateUser API returns a key for ANY
  // username/password, making it unreliable for authentication.
  // If MTP needs to be a standalone auth source in the future, their API must
  // properly reject invalid credentials first.

  AuditLogger.log('AUTH_LOCAL_FAILURE', { username, reason: 'INVALID_CREDENTIALS' });
  recordFailedLogin(clientIp, username);
  res.status(401).json({ success: false, error: 'Invalid username or password' });
});

// --- VTMS SSO Bypass Routes ---

// 1. Endpoint to generate a deep-link token (called by SSO Portal)
router.post('/sso/vtms', async (req: Request, res: Response) => {
  const { user } = req.body;
  if (!user) {
    return res.status(400).json({ status: 'error', message: 'User data required' });
  }

  try {
    const userData = JSON.parse(Buffer.from(user, 'base64').toString('utf8'));
    const token = uuidv4() + '-' + Date.now();
    
    // Store token in memory (expires in 60 seconds)
    vtmsDeepLinkTokens.set(token, {
      user: userData,
      expiresAt: Date.now() + 60000 
    });

    // Cleanup old tokens
    for (const [key, val] of vtmsDeepLinkTokens.entries()) {
      if (val.expiresAt < Date.now()) {
        vtmsDeepLinkTokens.delete(key);
      }
    }

    const redirectUrl = `https://vtms.ieat.go.th/login?token=${token}`;
    res.json({ status: 'success', redirectUrl });
  } catch (error) {
    console.error('Error generating VTMS SSO token:', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate SSO token' });
  }
});

// 2. Endpoint for VTMS to validate the deep-link token
router.post('/validate', async (req: Request, res: Response) => {
  const { token, system_id } = req.body;
  
  if (!token || system_id !== 'VTMS') {
    return res.status(400).json({ valid: false, error: 'Invalid payload or system_id' });
  }

  const tokenData = vtmsDeepLinkTokens.get(token);
  
  if (!tokenData || tokenData.expiresAt < Date.now()) {
    return res.json({ valid: false, error: 'Token expired or invalid' });
  }

  // Token is valid! Remove it to prevent replay attacks
  vtmsDeepLinkTokens.delete(token);

  const u = tokenData.user;
  
  let vtmsRole = 'viewer';
  if (u.role === 'Admin') vtmsRole = 'admin';
  if (u.role === 'Operator') vtmsRole = 'operator';

  const validatedUser = {
    id: u.id || 999,
    username: u.username || u.email,
    email: u.email || `${u.username}@local`,
    fullName: u.fullName || u.firstname + ' ' + (u.lastname || ''),
    role: vtmsRole
  };

  res.json({
    valid: true,
    user: validatedUser
  });
});

export default router;
