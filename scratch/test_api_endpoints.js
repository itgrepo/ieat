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

const runTests = async () => {
  console.log('Starting API Management CRUD Verification...\n');

  // ==========================================
  // 1. Group CRUD Test
  // ==========================================
  console.log('--- 1. Testing Group CRUD ---');
  
  // Create Group
  const addGroupRes = await testEndpoint('/addGroup', { group_name: 'CRUD_Test_Group' });
  if (addGroupRes.success) {
    console.log('✅ addGroup: Success');
  }

  // Read Groups and Find the new group
  const getGroupsRes = await testEndpoint('/getGroups');
  let testGroup = null;
  if (getGroupsRes.success && getGroupsRes.data && getGroupsRes.data.data) {
    testGroup = getGroupsRes.data.data.find(g => g.group_name === 'CRUD_Test_Group');
  }

  if (testGroup) {
    console.log(`✅ getGroups: Found created group with ID: ${testGroup.group_id}`);
    
    // Update Group Members
    const updateMembersRes = await testEndpoint('/updateGroupMembers', {
      group_id: testGroup.group_id,
      user_ids: ['admin_001']
    });
    if (updateMembersRes.success) {
      console.log('✅ updateGroupMembers: Success');
    }

    // Read Group Members
    const getMembersRes = await testEndpoint('/getGroupMembers', { group_id: testGroup.group_id });
    if (getMembersRes.success && getMembersRes.data && getMembersRes.data.assigned) {
      const assignedUser = getMembersRes.data.assigned.find(u => u.user_id === 'admin_001');
      if (assignedUser) {
        console.log('✅ getGroupMembers: Verified assigned member successfully');
      } else {
        console.error('❌ getGroupMembers: Assigned member not found');
      }
    }

    // Update Group Dataset Access
    const updateDatasetRes = await testEndpoint('/updateGroupDatasetAccess', {
      group_id: testGroup.group_id,
      service_ids: ['1', '2']
    });
    if (updateDatasetRes.success) {
      console.log('✅ updateGroupDatasetAccess: Success');
    }

    // Read Group Dataset Access
    const getDatasetRes = await testEndpoint('/getGroupDatasetAccess', { group_id: testGroup.group_id });
    if (getDatasetRes.success && getDatasetRes.data && getDatasetRes.data.assigned) {
      const assignedCount = getDatasetRes.data.assigned.length;
      if (assignedCount === 2) {
        console.log('✅ getGroupDatasetAccess: Verified 2 assigned datasets');
      } else {
        console.error(`❌ getGroupDatasetAccess: Expected 2 assigned datasets, found ${assignedCount}`);
      }
    }

    // Delete Group
    const deleteGroupRes = await testEndpoint('/deleteGroup', { group_id: testGroup.group_id });
    if (deleteGroupRes.success) {
      console.log('✅ deleteGroup: Success');
    }
  } else {
    console.error('❌ Group was not created or found.');
  }

  // ==========================================
  // 2. Organization CRUD Test
  // ==========================================
  console.log('\n--- 2. Testing Organization CRUD ---');
  
  // Create Organization
  const addOrgRes = await testEndpoint('/addOrganization', {
    org_name: 'CRUD_Test_Org',
    org_description: 'Description of CRUD Test Org'
  });
  if (addOrgRes.success) {
    console.log('✅ addOrganization: Success');
  }

  // Read Organizations
  const getOrgsRes = await testEndpoint('/getOrganizations');
  let testOrg = null;
  if (getOrgsRes.success && getOrgsRes.data && getOrgsRes.data.data) {
    testOrg = getOrgsRes.data.data.find(o => o.org_name === 'CRUD_Test_Org');
  }

  if (testOrg) {
    console.log(`✅ getOrganizations: Found created organization with ID: ${testOrg.org_id}`);

    // Update Organization
    const updateOrgRes = await testEndpoint('/updateOrganization', {
      org_id: testOrg.org_id,
      org_name: 'CRUD_Test_Org_Updated',
      org_description: 'Updated description'
    });
    if (updateOrgRes.success) {
      console.log('✅ updateOrganization: Success');
    }

    // Verify Update
    const getOrgsRes2 = await testEndpoint('/getOrganizations');
    let testOrgUpdated = null;
    if (getOrgsRes2.success && getOrgsRes2.data && getOrgsRes2.data.data) {
      testOrgUpdated = getOrgsRes2.data.data.find(o => o.org_id === testOrg.org_id);
    }
    if (testOrgUpdated && testOrgUpdated.org_name === 'CRUD_Test_Org_Updated') {
      console.log('✅ updateOrganization: Verified name update successfully');
    } else {
      console.error('❌ updateOrganization: Name was not updated');
    }

    // Delete Organization
    const deleteOrgRes = await testEndpoint('/deleteOrganization', { org_id: testOrg.org_id });
    if (deleteOrgRes.success) {
      console.log('✅ deleteOrganization: Success');
    }
  } else {
    console.error('❌ Organization was not created or found.');
  }

  // ==========================================
  // 3. Category CRUD Test
  // ==========================================
  console.log('\n--- 3. Testing Category CRUD ---');

  // Create Category
  const addCatRes = await testEndpoint('/addCategory', { name: 'CRUD_Test_Cat' });
  if (addCatRes.success) {
    console.log('✅ addCategory: Success');
  }

  // Read Categories
  const getCatsRes = await testEndpoint('/getCategories');
  let testCat = null;
  if (getCatsRes.success && getCatsRes.data && getCatsRes.data.data) {
    testCat = getCatsRes.data.data.find(c => c.name === 'CRUD_Test_Cat');
  }

  if (testCat) {
    console.log(`✅ getCategories: Found created category with ID: ${testCat.id}`);

    // Update Category
    const updateCatRes = await testEndpoint('/updateCategory', {
      id: testCat.id,
      name: 'CRUD_Test_Cat_Updated'
    });
    if (updateCatRes.success) {
      console.log('✅ updateCategory: Success');
    }

    // Verify Update
    const getCatsRes2 = await testEndpoint('/getCategories');
    let testCatUpdated = null;
    if (getCatsRes2.success && getCatsRes2.data && getCatsRes2.data.data) {
      testCatUpdated = getCatsRes2.data.data.find(c => c.id === testCat.id);
    }
    if (testCatUpdated && testCatUpdated.name === 'CRUD_Test_Cat_Updated') {
      console.log('✅ updateCategory: Verified name update successfully');
    } else {
      console.error('❌ updateCategory: Name was not updated');
    }

    // Delete Category
    const deleteCatRes = await testEndpoint('/deleteCategory', { id: testCat.id });
    if (deleteCatRes.success) {
      console.log('✅ deleteCategory: Success');
    }
  } else {
    console.error('❌ Category was not created or found.');
  }

  // ==========================================
  // 4. Role & Permissions CRUD Test
  // ==========================================
  console.log('\n--- 4. Testing Role & Permissions CRUD ---');

  // Create Role
  const addRoleRes = await testEndpoint('/mgmt/addRole', { role_name: 'CRUD_Test_Role' });
  if (addRoleRes.success) {
    console.log('✅ addRole: Success');
  }

  // Read Roles
  const getRolesRes = await testEndpoint('/mgmt/getRoles');
  let testRole = null;
  if (getRolesRes.success && getRolesRes.data) {
    testRole = getRolesRes.data.find(r => r.previlage_name === 'CRUD_Test_Role');
  }

  if (testRole) {
    console.log(`✅ getRoles: Found created role with ID: ${testRole.previlage_id}`);

    // Read Menu Permissions and verify initial state for new role
    const getMenuRes = await testEndpoint('/mgmt/getMenu');
    let roleMenus = [];
    if (getMenuRes.success && getMenuRes.data && getMenuRes.data.data) {
      roleMenus = getMenuRes.data.data.filter(p => String(p.previlage_id) === String(testRole.previlage_id));
    }
    console.log(`✅ getMenu: Verified ${roleMenus.length} default menu rules mapped to new role`);

    // Save Permission (Update a menu rule)
    if (roleMenus.length > 0) {
      const targetMenu = roleMenus[0];
      const savePermRes = await testEndpoint('/mgmt/savePermission', {
        data: {
          previlage_id: testRole.previlage_id,
          menu_name_id: targetMenu.menu_name_id,
          menu_name: targetMenu.menu_name,
          value: 'Yes'
        }
      });
      if (savePermRes.success) {
        console.log('✅ savePermission: Success');
      }

      // Verify Save Permission
      const getMenuRes2 = await testEndpoint('/mgmt/getMenu');
      let targetMenuUpdated = null;
      if (getMenuRes2.success && getMenuRes2.data && getMenuRes2.data.data) {
        targetMenuUpdated = getMenuRes2.data.data.find(p => 
          String(p.previlage_id) === String(testRole.previlage_id) && 
          String(p.menu_name_id) === String(targetMenu.menu_name_id)
        );
      }
      if (targetMenuUpdated && targetMenuUpdated.value === 'Yes') {
        console.log('✅ savePermission: Verified value toggled to "Yes" successfully');
      } else {
        console.error('❌ savePermission: Permission value was not updated');
      }
    }
  } else {
    console.error('❌ Role was not created or found.');
  }

  console.log('\nVerification completed!');
};

runTests();
