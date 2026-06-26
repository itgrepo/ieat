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

    console.log(`[POST ${path}] Status: ${res.status}`);
    if (res.status === 200 || res.status === 201) {
      console.log(`[SUCCESS]`, typeof data === 'object' ? JSON.stringify(data).slice(0, 150) + '...' : data.slice(0, 150));
      return { success: true, data };
    } else {
      console.error(`[FAILED]`, data);
      return { success: false, data };
    }
  } catch (err) {
    console.error(`[ERROR POST ${path}]`, err.message);
    return { success: false, error: err.message };
  }
};

const run = async () => {
  console.log('Testing Dataset Access Management Endpoints...\n');

  // Test 1: getDatasetAccessGroups
  console.log('--- 1. getDatasetAccessGroups ---');
  const groupsRes = await testEndpoint('/getDatasetAccessGroups', { service_id: '1' });

  // Test 2: updateDatasetAccessGroups
  console.log('\n--- 2. updateDatasetAccessGroups ---');
  if (groupsRes.success && groupsRes.data && groupsRes.data.assigned) {
    const originalIds = groupsRes.data.assigned.map(g => g.group_id);
    console.log('Original Assigned Group IDs:', originalIds);

    // Temp add group ID "3" if not already assigned
    const testIds = [...originalIds];
    if (!testIds.includes('3')) testIds.push('3');

    const updateRes = await testEndpoint('/updateDatasetAccessGroups', {
      service_id: '1',
      group_ids: testIds
    });

    if (updateRes.success) {
      // Re-fetch and confirm
      console.log('Verifying update...');
      const checkRes = await testEndpoint('/getDatasetAccessGroups', { service_id: '1' });
      if (checkRes.success && checkRes.data && checkRes.data.assigned) {
        const hasThree = checkRes.data.assigned.some(g => g.group_id === '3');
        if (hasThree) {
          console.log('✅ updateDatasetAccessGroups: Verification Successful');
        } else {
          console.error('❌ updateDatasetAccessGroups: Group 3 was not assigned');
        }
      }

      // Revert to original
      console.log('Reverting to original settings...');
      await testEndpoint('/updateDatasetAccessGroups', {
        service_id: '1',
        group_ids: originalIds
      });
    }
  }

  // Test 3: getDatasetAccessUsers
  console.log('\n--- 3. getDatasetAccessUsers ---');
  const usersRes = await testEndpoint('/getDatasetAccessUsers', { service_id: '1' });

  // Test 4: updateDatasetAccessUsers
  console.log('\n--- 4. updateDatasetAccessUsers ---');
  if (usersRes.success && usersRes.data && usersRes.data.assigned) {
    const originalUserIds = usersRes.data.assigned.map(u => u.user_id);
    console.log('Original Assigned User IDs:', originalUserIds);

    // Assign a test user ID (e.g. from available users list if any, otherwise mock test)
    let testUserId = 'admin_001';
    if (usersRes.data.available && usersRes.data.available.length > 0) {
      testUserId = usersRes.data.available[0].user_id;
    }
    const testIds = [...originalUserIds];
    if (!testIds.includes(testUserId)) testIds.push(testUserId);

    const updateRes = await testEndpoint('/updateDatasetAccessUsers', {
      service_id: '1',
      user_ids: testIds
    });

    if (updateRes.success) {
      // Re-fetch and confirm
      console.log('Verifying update...');
      const checkRes = await testEndpoint('/getDatasetAccessUsers', { service_id: '1' });
      if (checkRes.success && checkRes.data && checkRes.data.assigned) {
        const hasUser = checkRes.data.assigned.some(u => u.user_id === testUserId);
        if (hasUser) {
          console.log('✅ updateDatasetAccessUsers: Verification Successful');
        } else {
          console.error('❌ updateDatasetAccessUsers: User was not assigned');
        }
      }

      // Revert to original
      console.log('Reverting to original settings...');
      await testEndpoint('/updateDatasetAccessUsers', {
        service_id: '1',
        user_ids: originalUserIds
      });
    }
  }

  console.log('\nVerification completed!');
};

run();
