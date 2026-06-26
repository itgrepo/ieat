const { execSync } = require('child_process');

const encodeUserData = (userData) => {
  try {
    const jsonStr = JSON.stringify(userData);
    const b64 = Buffer.from(jsonStr).toString('base64');
    const reversed = b64.split('').reverse().join('');
    const randomChars = Math.random().toString(36).substring(2, 7).padEnd(5, 'x');
    return reversed + randomChars;
  } catch (e) {
    console.error('Encoding error:', e);
    return '';
  }
};

const BASE_URL = 'https://dsp.ieat.go.th/backend/api';
const user = { username: 'dsp@wisdomvast.com', role: 'Admin' };
const encodedUser = encodeUserData(user);

const testEndpoint = async (path, extraData = {}) => {
  const payload = {
    user: encodedUser,
    ...extraData
  };

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (res.status === 200 || res.status === 201) {
      return { success: true, data };
    } else {
      console.error(`[FAILED POST ${path}] Status ${res.status}:`, data);
      return { success: false, data };
    }
  } catch (err) {
    console.error(`[ERROR POST ${path}]:`, err.message);
    return { success: false, error: err.message };
  }
};

const run = async () => {
  console.log('=== STARTING DISK PERSISTENCE VERIFICATION ===\n');

  // Step 1: Create Organization
  console.log('Step 1: Creating persistent organization...');
  const addRes = await testEndpoint('/addOrganization', {
    org_name: 'PERSISTENCE_TEST_ORG',
    org_description: 'Verify this survives a systemd restart'
  });

  if (!addRes.success) {
    console.error('❌ Failed to add organization. Aborting.');
    return;
  }
  console.log('✅ Organization created successfully.');

  // Step 2: Retrieve list and find ID
  console.log('\nStep 2: Checking if organization exists in list...');
  const listRes1 = await testEndpoint('/getOrganizations');
  let targetOrg = null;
  if (listRes1.success && listRes1.data && listRes1.data.data) {
    targetOrg = listRes1.data.data.find(o => o.org_name === 'PERSISTENCE_TEST_ORG');
  }

  if (!targetOrg) {
    console.error('❌ Organization not found in retrieved list. Aborting.');
    return;
  }
  console.log(`✅ Found organization in database. ID: ${targetOrg.org_id}`);

  // Step 3: Restart backend service remotely
  console.log('\nStep 3: Restarting remote backend service via systemd...');
  try {
    const output = execSync('expect restart_backend.exp', { encoding: 'utf-8', cwd: '/Users/natthawutjantakul/git_ieat' });
    console.log('✅ Backend service restart completed successfully.');
  } catch (err) {
    console.error('❌ Failed to restart backend service:', err.message);
    return;
  }

  // Step 4: Verify organization still exists in list
  console.log('\nStep 4: Querying organizations again after restart...');
  const listRes2 = await testEndpoint('/getOrganizations');
  let targetOrgPostRestart = null;
  if (listRes2.success && listRes2.data && listRes2.data.data) {
    targetOrgPostRestart = listRes2.data.data.find(o => o.org_id === targetOrg.org_id);
  }

  if (targetOrgPostRestart && targetOrgPostRestart.org_name === 'PERSISTENCE_TEST_ORG') {
    console.log('✅ SUCCESS: Organization survived service restart! Persistence is fully functional.');
  } else {
    console.error('❌ FAILURE: Organization did not survive restart. Data may only be in memory.');
  }

  // Step 5: Cleanup
  console.log('\nStep 5: Cleaning up (deleting test organization)...');
  const deleteRes = await testEndpoint('/deleteOrganization', { org_id: targetOrg.org_id });
  if (deleteRes.success) {
    console.log('✅ Cleanup successful.');
  } else {
    console.error('❌ Cleanup failed.');
  }

  console.log('\n=== DISK PERSISTENCE VERIFICATION COMPLETED ===');
};

run();
