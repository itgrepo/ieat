echo "=== 1. Testing PMIS REST API (Validate User) ==="
curl -s -X POST https://dsp.ieat.go.th/backend/api/external/pmis/validate-user \
-H "Content-Type: application/json" \
-d '{"username":"pmis_officer"}'

echo -e "\n\n=== 2. Testing PMIS SOAP API (Get Token) ==="
curl -s -X POST https://dsp.ieat.go.th/backend/api/soap/pmis/token \
-H "Content-Type: text/xml" \
-d '<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pmis="http://pmis.ieat.go.th/">
  <soapenv:Body>
    <pmis:GetToken>
      <pmis:ClientId>SSO_PORTAL_CLIENT</pmis:ClientId>
      <pmis:ClientSecret>SSO_SECRET_KEY</pmis:ClientSecret>
    </pmis:GetToken>
  </soapenv:Body>
</soapenv:Envelope>'

echo -e "\n\n=== 3. Testing PMIS SOAP API (Validate User) ==="
curl -s -X POST https://dsp.ieat.go.th/backend/api/soap/pmis \
-H "Content-Type: text/xml" \
-d '<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pmis="http://pmis.ieat.go.th/">
  <soapenv:Body>
    <pmis:ValidateUser>
      <pmis:username>pmis_officer</pmis:username>
    </pmis:ValidateUser>
  </soapenv:Body>
</soapenv:Envelope>'
echo ""
