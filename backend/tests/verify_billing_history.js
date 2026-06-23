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

    console.log('\n2. Fetching patients to find a valid patient...');
    const patientsRes = await fetch(`${BASE_URL}/patients`, { headers });
    if (!patientsRes.ok) {
      throw new Error(`Fetch patients failed: ${await patientsRes.text()}`);
    }
    const patientsData = await patientsRes.json();
    const patients = Array.isArray(patientsData?.data) ? patientsData.data : (patientsData?.data?.patients || []);
    if (patients.length === 0) {
      throw new Error('No patients found in the database to test with.');
    }
    const patient = patients[0];
    console.log(`✅ Selected patient: ${patient.fullName} (${patient._id})`);

    console.log('\n3. Fetching medicines to find a valid medicine...');
    const medicinesRes = await fetch(`${BASE_URL}/pharmacy`, { headers });
    if (!medicinesRes.ok) {
      throw new Error(`Fetch medicines failed: ${await medicinesRes.text()}`);
    }
    const medicinesData = await medicinesRes.json();
    const medicines = medicinesData?.data?.medicines || [];
    if (medicines.length === 0) {
      throw new Error('No medicines found in the database to test with.');
    }
    const medicine = medicines[0];
    console.log(`✅ Selected medicine: ${medicine.medicineName} (${medicine._id})`);

    console.log('\n4. Raising a requirement (dispense) with billing details...');
    const requirementPayload = {
      patientId: patient._id,
      medicines: [
        {
          medicineId: medicine._id,
          medicineName: medicine.medicineName,
          quantity: 2,
          price: medicine.mrp || 15,
          notes: 'Test dispense note'
        }
      ],
      requestedMedicines: [
        {
          name: 'Custom Aspirin Test',
          strength: '100mg',
          unitType: 'Tablet',
          quantity: 3,
          price: 5,
          notes: 'Custom request note'
        }
      ],
      total: 55,
      paymentMethod: 'card',
      amountPaid: 55
    };

    const requirementRes = await fetch(`${BASE_URL}/pharmacy/requirements`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requirementPayload)
    });

    if (!requirementRes.ok) {
      throw new Error(`Create requirement failed: ${await requirementRes.text()}`);
    }

    const requirementData = await requirementRes.json();
    console.log('✅ Requirement raised successfully:', requirementData);

    console.log('\n5. Verifying that a History record was created...');
    const historyRes = await fetch(`${BASE_URL}/pharmacy/history`, { headers });
    if (!historyRes.ok) {
      throw new Error(`Fetch history failed: ${await historyRes.text()}`);
    }
    const historyData = await historyRes.json();
    const latestHistory = historyData?.data?.[0];
    
    if (latestHistory && String(latestHistory.patientId?._id || latestHistory.patientId) === String(patient._id)) {
      console.log('✅ Success: History record created and matches patient!');
      console.log('   Total:', latestHistory.total);
      console.log('   Amount Paid:', latestHistory.amountPaid);
      console.log('   Payment Method:', latestHistory.paymentMethod);
      console.log('   Medicines count:', latestHistory.medicines?.length);
      console.log('   Requested medicines count:', latestHistory.requestedMedicines?.length);
    } else {
      console.error('❌ Failure: Latest history record does not match or was not created.');
    }

    console.log('\n6. Verifying that a Billing record was created...');
    const billingRes = await fetch(`${BASE_URL}/billing`, { headers });
    if (!billingRes.ok) {
      throw new Error(`Fetch billing failed: ${await billingRes.text()}`);
    }
    const billingData = await billingRes.json();
    const latestBilling = billingData?.data?.[0];

    if (latestBilling && String(latestBilling.patientId?._id || latestBilling.patientId) === String(patient._id)) {
      console.log('✅ Success: Billing record created and matches patient!');
      console.log('   Billing ID:', latestBilling.billingId);
      console.log('   Subtotal:', latestBilling.subtotal);
      console.log('   Total:', latestBilling.total);
      console.log('   Payment Status:', latestBilling.paymentStatus);
      console.log('   Items count:', latestBilling.items?.length);
      console.log('   First Item:', latestBilling.items?.[0]?.serviceName, 'x', latestBilling.items?.[0]?.quantity);
    } else {
      console.error('❌ Failure: Latest billing record does not match or was not created.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

test();
