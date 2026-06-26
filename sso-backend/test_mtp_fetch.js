const axios = require('axios');

async function test() {
  const username = 'tester_mtp';
  const password = '@WSX3edc';
  let mtpKey = null;
  let mtpType = 2;

  try {
    const wsdlUrl = 'https://uat-mtpportnet-ent.nidpro.tech/srx/service/service_sso.php';
    const getAccessXml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://uat-mtpportnet-ent.nidpro.tech/srx/service"><soapenv:Header/><soapenv:Body><ser:get_AccessToken><Key>3802ac196bbccddde9dd1dd4469ee230555ftwwfsf3ac196bbccddde9dd1</Key></ser:get_AccessToken></soapenv:Body></soapenv:Envelope>`;
    
    const tokenRes = await axios.post(wsdlUrl, getAccessXml, { headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' } });
    const tokenMatch = tokenRes.data.match(/<return xsi:type="xsd:string">(.*?)<\/return>/);
    if (tokenMatch && tokenMatch[1]) {
      const tokenGen = tokenMatch[1];
      
      const checkValidateXml = (type) => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://uat-mtpportnet-ent.nidpro.tech/srx/service"><soapenv:Header/><soapenv:Body><ser:check_ValidateUser><TokenGen>${tokenGen}</TokenGen><US>${username}</US><PW>${password}</PW><TypeUser>${type}</TypeUser></ser:check_ValidateUser></soapenv:Body></soapenv:Envelope>`;
      
      let valRes = await axios.post(wsdlUrl, checkValidateXml(2), { headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' } });
      let keyMatch = valRes.data.match(/<return xsi:type="xsd:string">(.*?)<\/return>/);
      
      if (!keyMatch || !keyMatch[1] || keyMatch[1].length < 10) {
        mtpType = 1;
        valRes = await axios.post(wsdlUrl, checkValidateXml(1), { headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': '""' } });
        keyMatch = valRes.data.match(/<return xsi:type="xsd:string">(.*?)<\/return>/);
      }
      
      if (keyMatch && keyMatch[1] && keyMatch[1].length > 10) {
        mtpKey = keyMatch[1];
        console.log("Success! mtpKey =", mtpKey);
      } else {
        console.log("Failed to match key. valRes 1:", valRes.data);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
