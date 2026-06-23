const BASE_URL = 'http://localhost:5000/api';

async function test() {
  try {
    console.log('1. Attempting login as admin...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@medico.com',
        password: 'medicouseradmin'
      })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}: ${await loginRes.text()}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log('✅ Logged in successfully. Token acquired.');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n2. Creating a new User with role DOCTOR (simulating Add User)...');
    const randomSuffix = Math.floor(Math.random() * 10000);
    const userPayload = {
      name: `Dr. Automated Test ${randomSuffix}`,
      email: `test.doctor.${randomSuffix}@bireena.com`,
      password: 'SecurePassword@123',
      role: 'DOCTOR',
      phone: '+919999988888'
    };

    const createUserRes = await fetch(`${BASE_URL}/auth/create-user`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userPayload)
    });

    if (!createUserRes.ok) {
      throw new Error(`Create user failed: ${await createUserRes.text()}`);
    }

    const userData = await createUserRes.json();
    const newUser = userData.data.user;
    console.log(`✅ User created successfully: ${newUser.name} (ID: ${newUser._id})`);

    console.log('\n3. Fetching all doctor users and verifying our new user has no doctor profile yet...');
    const doctorsRes = await fetch(`${BASE_URL}/doctors`, { headers });
    if (!doctorsRes.ok) {
      throw new Error(`Fetch doctors failed: ${await doctorsRes.text()}`);
    }
    const doctorsData = await doctorsRes.json();
    const doctorsList = doctorsData?.data || [];
    
    const hasProfile = doctorsList.some(d => String(d.userId?._id || d.userId) === String(newUser._id));
    if (hasProfile) {
      throw new Error('Failure: The new user already has a doctor profile.');
    }
    console.log('✅ Confirmed: New user has no doctor profile in the database.');

    console.log('\n4. Alloting slot and room (creating Doctor profile)...');
    const allotPayload = {
      userId: newUser._id,
      fullName: newUser.name,
      specialization: 'Neurology',
      experience: 6,
      qualification: 'MBBS, DM (Neurology)',
      registrationNumber: `REG-${randomSuffix}`,
      roomNumber: 'Room 304B',
      consultationFee: 750,
      description: 'Automated test biography description',
      timeSlots: [
        { day: 'Tuesday', from: '10:00', to: '16:00' },
        { day: 'Friday', from: '12:00', to: '18:00' }
      ]
    };

    const allotRes = await fetch(`${BASE_URL}/doctors`, {
      method: 'POST',
      headers,
      body: JSON.stringify(allotPayload)
    });

    if (!allotRes.ok) {
      throw new Error(`Allotment failed: ${await allotRes.text()}`);
    }

    const allotData = await allotRes.json();
    const createdDoctor = allotData.data.doctor;
    console.log(`✅ Doctor profile created successfully: Code: ${createdDoctor.doctorCode}, Room: ${createdDoctor.roomNumber}`);

    console.log('\n5. Verifying that the new doctor is now returned by /doctors API with all details...');
    const verifyRes = await fetch(`${BASE_URL}/doctors`, { headers });
    if (!verifyRes.ok) {
      throw new Error(`Verify fetch doctors failed: ${await verifyRes.text()}`);
    }
    const verifyData = await verifyRes.json();
    const updatedDoctors = verifyData?.data || [];
    
    const foundDoc = updatedDoctors.find(d => String(d._id) === String(createdDoctor._id));
    if (!foundDoc) {
      throw new Error('Failure: Newly configured doctor profile was not found in the doctors list.');
    }

    console.log('✅ SUCCESS: Doctor profile is configured and live!');
    console.log('   Name:', foundDoc.name);
    console.log('   Specialization:', foundDoc.specialization);
    console.log('   Room Number:', foundDoc.roomNumber);
    console.log('   Fee:', foundDoc.consultationFee);
    console.log('   Experience:', foundDoc.experience);
    console.log('   Schedule Slots count:', foundDoc.schedule?.length);
    console.log('   First Slot:', foundDoc.schedule?.[0]?.day, foundDoc.schedule?.[0]?.startTime, 'to', foundDoc.schedule?.[0]?.endTime);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

test();
