import { Router, Request, Response } from 'express';
import { AuditLogRepository } from '../repositories/audit-log.repository';

const router = Router();
const logRepo = new AuditLogRepository();

// Helper to convert enriched logs to CSV format (RFC 4180 compliant)
function convertToCsv(logs: any[]): string {
  const headers = [
    'Log ID', 'Timestamp', 'Event Type', 'Application ID', 'User ID', 'Username', 
    'Citizen ID', 'First Name', 'Last Name', 'Email', 'Department', 'Role', 
    'IP Address', 'Mac Address', 'Location', 'User Agent', 'Status', 'Details'
  ];
  const csvRows = [headers.join(',')];

  for (const log of logs) {
    const detailsStr = JSON.stringify(log.details || {}).replace(/"/g, '""');
    
    const row = [
      `"${log.logId}"`,
      `"${log.timestamp}"`,
      `"${log.eventType}"`,
      `"${log.applicationId}"`,
      `"${log.userId}"`,
      `"${log.username}"`,
      `"${log.citizenId}"`,
      `"${log.firstName}"`,
      `"${log.lastName}"`,
      `"${log.email}"`,
      `"${log.department}"`,
      `"${log.role}"`,
      `"${log.ipAddress}"`,
      `"${log.macAddress}"`,
      `"${log.location}"`,
      `"${log.userAgent}"`,
      `"${log.status}"`,
      `"${detailsStr}"`
    ];
    csvRows.push(row.join(','));
  }

  return csvRows.join('\n');
}

router.get('/', async (req: Request, res: Response) => {
  // 1. API Key Authentication
  const requestApiKey = req.headers['x-api-key'] || req.query.apiKey;
  const configuredApiKey = process.env.BA_API_KEY || 'IEAT-BA-LOG-ANALYTICS-2026';

  if (!requestApiKey || requestApiKey !== configuredApiKey) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid API Key' });
  }

  try {
    let logs = await logRepo.getAll();

    // Sort by timestamp descending (latest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 2. Query Filtering
    const { startDate, endDate, event, username, format } = req.query;

    if (startDate) {
      const start = new Date(startDate as string);
      if (!isNaN(start.getTime())) {
        logs = logs.filter(log => new Date(log.timestamp) >= start);
      }
    }

    if (endDate) {
      let endStr = endDate as string;
      // If it is just a date string (YYYY-MM-DD), append end of day timestamp
      if (/^\d{4}-\d{2}-\d{2}$/.test(endStr)) {
        endStr += 'T23:59:59.999Z';
      }
      const end = new Date(endStr);
      if (!isNaN(end.getTime())) {
        logs = logs.filter(log => new Date(log.timestamp) <= end);
      }
    }

    if (event) {
      const eventStr = (event as string).toLowerCase();
      logs = logs.filter(log => log.event?.toLowerCase().includes(eventStr));
    }

    if (username) {
      const userStr = (username as string).toLowerCase();
      logs = logs.filter(log => {
        const logUser = log.details?.username || log.details?.user?.username || '';
        return logUser.toLowerCase().includes(userStr);
      });
    }

    // 3. Map to Data Dictionary Schema with Mock Fallbacks
    const enrichedLogs = logs.map(log => {
      const evt = log.event || '';
      const logUsername = log.details?.username || log.details?.user?.username || 'unknown';
      const fullName = log.details?.fullName || log.details?.user?.fullName || 'Mock_FirstName Mock_LastName';
      const nameParts = fullName.split(' ');
      const firstName = log.details?.firstName || nameParts[0] || 'Mock_FirstName';
      const lastName = log.details?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Mock_LastName');
      
      return {
        logId: log.id || '',
        timestamp: log.timestamp || '',
        eventType: evt,
        applicationId: log.details?.applicationId || log.details?.system || 'SSO_PORTAL',
        userId: log.userId || log.details?.userId || 'system_mock_id',
        username: logUsername,
        citizenId: log.details?.citizenId || log.details?.user?.citizenId || '1100000000000',
        firstName: firstName,
        lastName: lastName,
        email: log.details?.email || log.details?.user?.email || `${logUsername}@mock-ieat.go.th`,
        department: log.details?.department || log.details?.user?.department || 'Mock_Department',
        role: log.details?.role || log.details?.user?.role || 'Mock_Role',
        ipAddress: log.ip || '127.0.0.1',
        macAddress: log.details?.macAddress || '00:00:00:00:00:00',
        location: log.details?.location || 'Bangkok, TH',
        userAgent: log.details?.userAgent || 'Mozilla/5.0 (Mock Browser)',
        status: log.details?.status || (evt.includes('FAILED') ? 'Failed' : 'Success'),
        details: log.details || {}
      };
    });

    // 4. Output Formatting
    if (format === 'csv') {
      const csvData = convertToCsv(enrichedLogs);
      const filename = `sso_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csvData);
    }

    // Default: JSON
    return res.json({
      status: 'success',
      count: enrichedLogs.length,
      data: enrichedLogs
    });

  } catch (error) {
    console.error('Error exporting BA logs:', error);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

export default router;
