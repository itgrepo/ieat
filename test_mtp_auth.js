const axios = require('axios');
const https = require('https');

async function testAuth(username, password) {
  try {
    const wsdlUrl = 'https://uat-mtpportnet-ent.nidpro.tech/srx/service/service_sso.php';
    const agent = new https.Agent({ rejectUnauthorized: false });

    // Get TokenGen
    const getAccessXml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://uat-mtpportnet-ent.nidpro.tech/srx/service"><soapenv:Header/><soapenv:Body><ser:get_AccessToken><Key>3802ac196bbccddde9dd1dd4469ee230555ftwwfsf3ac196bbccddde9dd1</Key></ser:get_AccessToken></soapenv:Body></soapenv:Envelope>`;
    const tokenRes = await axios.post(wsdlUrl, getAccessXml, { 
      headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' },
      httpsAgent: agent
    });
    const tokenMatch = tokenRes.data.match(/<return xsi:type="xsd:string">(.*?)<\/return>/);
    if (!tokenMatch) return console.log('No token');
    const tokenGen = tokenMatch[1];

    // Check Type 2
    let checkValidateXml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://uat-mtpportnet-ent.nidpro.tech/srx/service"><soapenv:Header/><soapenv:Body><ser:check_ValidateUser><TokenGen>${tokenGen}</TokenGen><US>${username}</US><PW>${password}</PW><TypeUser>2</TypeUser></ser:check_ValidateUser></soapenv:Body></soapenv:Envelope>`;
    let valRes = await axios.post(wsdlUrl, checkValidateXml, { headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' }, httpsAgent: agent });
    console.log(`[${password}] Type 2 response:`, valRes.data);

    // Check Type 1
    checkValidateXml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://uat-mtpportnet-ent.nidpro.tech/srx/service"><soapenv:Header/><soapenv:Body><ser:check_ValidateUser><TokenGen>${tokenGen}</TokenGen><US>${username}</US><PW>${password}</PW><TypeUser>1</TypeUser></ser:check_ValidateUser></soapenv:Body></soapenv:Envelope>`;
    valRes = await axios.post(wsdlUrl, checkValidateXml, { headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' }, httpsAgent: agent });
    console.log(`[${password}] Type 1 response:`, valRes.data);

  } catch (err) { console.error(err.message); }
}

async function run() {
  console.log("--- Testing Correct Password ---");
  await testAuth('tester_mtp', 'WSX3edc');
  console.log("\\n--- Testing Wrong Password ---");
  await testAuth('tester_mtp', 'wrongpass123');
  console.log("\\n--- Testing Junk Username ---");
  await testAuth('asdfasdfasdf', 'wrongpass123');
}
run();
