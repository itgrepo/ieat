คุณเป็น system/business analyst และ solution designer สำหรับงาน Single Sign-On (SSO)

โจทย์:
ฉันกำลังเริ่มดำเนินการออกแบบระบบ SSO สำหรับเชื่อมหลายหน่วยงาน โดย “ยังไม่ต้องใช้ Keycloak” และต้องการออกแบบโครงข้อมูล + widget สำหรับตั้งค่า login source ให้รองรับหลายรูปแบบ เช่น SAML, OIDC, AD/LDAP

บริบทสำคัญ:

1. ฝั่งหน่วยงานราชการส่วนใหญ่จะเป็น SAML
2. บางระบบอาจเป็น OIDC
3. บางแหล่งอาจเป็น AD/LDAP
4. เราต้องการให้ระบบของเรามีหน้า config / widget สำหรับเพิ่ม login source ได้
5. widget ต้องรองรับการเลือกประเภท login เช่น SAML / OIDC / AD
6. เมื่อเลือกประเภทแล้ว ต้องแสดง field ที่เกี่ยวข้องเฉพาะของประเภทนั้น
7. สำหรับ AD/LDAP หรือ source อื่น ๆ ต้องรองรับกรณีที่ข้อมูลมาตรฐานมีไม่ครบ
8. ถ้าข้อมูลบางอย่างไม่มี ต้องสามารถปล่อย blank ได้ หรือ fallback ไปใช้ local mapping / local master ของระบบเราได้
9. อย่าบังคับว่าทุกหน่วยงานต้องมี table เหมือนกันทั้งหมด ให้คิดแบบ capability-based ว่า “มีข้อมูลอะไรให้ใช้บ้าง”

ข้อมูลที่มีอยู่แล้วจากไฟล์/ชีต:
A. User Data Table

* UserID
* Username
* PasswordHash
* FullName
* Email
* Department/Affiliation
* RoleID
* LastLogin

B. Roles Table

* RoleID
* RoleName
* Description

C. Applications_Services Table

* AppID
* AppName
* AppURL

ข้อสังเกต:

* ตอนนี้ organization/department ยังอาจเป็นเพียง field ใน user ไม่ได้เป็น master table แยก
* role ตอนนี้ยังเป็นระดับ role master พื้นฐาน
* application ตอนนี้ยังเป็น registry พื้นฐาน ยังไม่ใช่ SSO config
* เอกสารที่มีตอนนี้ยังไม่ใช่ SAML/OIDC integration spec เต็มรูปแบบ

สิ่งที่ต้องการจากคุณ:

1. สรุปโครงสร้างระบบ SSO แบบไม่ใช้ Keycloak
2. ออกแบบ canonical data model กลางของระบบเรา
3. แยกให้ออกว่าอะไรคือ

   * source data จากภายนอก
   * local data ของระบบเรา
   * optional/fallback data
4. ออกแบบ widget / onboarding form สำหรับตั้งค่า login source
5. แยก field ของ widget ตามประเภท:

   * SAML
   * OIDC
   * AD/LDAP
6. เสนอ capability checklist แทนการยึดติดกับคำว่า “มี 4 table มาตรฐานไหม”
7. เสนอ fallback behavior กรณี source ไม่มีข้อมูลบางชนิด
8. ระบุ field mapping ที่ควรมีสำหรับ user identity, role, organization, application
9. ระบุว่าข้อมูลใด “ควรมี”, “ถ้ามีก็ดี”, “optional”
10. สรุปเป็นโครงสร้างที่พร้อมส่งต่อให้ทีม dev หรือ agent ทำต่อได้ทันที

รูปแบบคำตอบที่ต้องการ:
ตอบเป็นหัวข้อชัดเจนตามลำดับนี้

[1] Architecture Overview

* อธิบายภาพรวมระบบ SSO แบบไม่ใช้ Keycloak
* ระบุ component หลักที่ควรมี

[2] Canonical Data Model

* ตาราง/โมเดลกลางที่ระบบเราควรมี
* เช่น IdentitySource, UserProfile, Role, UserRoleMapping, Organization, Application, AppAccessMapping, SSOConfig
* ระบุ field สำคัญของแต่ละตาราง

[3] Source Capability Model

* ระบุว่าแต่ละ source อาจมีหรือไม่มีข้อมูลอะไรได้บ้าง
* จัดเป็น checklist เช่น:

  * user account
  * email
  * full name
  * department
  * role/group
  * employee id
  * citizen id
  * app assignment
  * active status
  * last login

[4] Login Source Widget Design

* ออกแบบหน้า config/onboarding
* แยก step เช่น:

  1. เลือกประเภท login
  2. กรอก config protocol
  3. เลือก capability ที่ source นี้มี
  4. map field เข้าสู่ canonical model
  5. ตั้ง fallback/local mapping
  6. test connection / test login

[5] Protocol-specific Fields
แยก field สำหรับ:

* SAML:

  * Entity ID
  * SSO URL
  * SLO URL
  * ACS URL
  * Metadata URL / Metadata XML
  * X509 Certificate
  * NameID Format
  * Signature / Encryption options
  * Attribute mapping
* OIDC:

  * Issuer
  * Authorization URL
  * Token URL
  * UserInfo URL
  * JWKS URL
  * Client ID
  * Client Secret
  * Redirect URI
  * Scope
  * Claim mapping
* AD/LDAP:

  * Server URL
  * Port
  * Domain
  * Base DN
  * Bind DN
  * Bind Password
  * User Search Filter
  * Group Search Base
  * Username Attribute
  * Email Attribute
  * Fullname Attribute
  * Department Attribute
  * SSL / TLS options

[6] Fallback Rules

* ถ้า source ไม่มี department ให้ทำอย่างไร
* ถ้า source ไม่มี role ให้ทำอย่างไร
* ถ้า source ไม่มี application mapping ให้ทำอย่างไร
* ถ้า source ไม่มี unique identifier บางตัว ให้ทำอย่างไร
* เสนอหลักเกณฑ์การใช้ local master data ของระบบเรา

[7] Recommended Additions to Existing Sheets

* จาก User Data Table / Roles Table / Applications_Services Table เดิม
* ระบุว่าควรเพิ่ม field อะไรบ้าง
* โดยแยกว่า:

  * must-have
  * should-have
  * optional

[8] Deliverable for Dev Team

* สรุป requirement ที่ dev เอาไปสร้าง DB schema และ widget ได้เลย
* ระบุลำดับการทำงานที่เหมาะสม

ข้อกำหนดสำคัญในการตอบ:

* ห้ามตอบกว้างแบบทฤษฎีล้วน
* ต้องตอบเชิงออกแบบใช้งานจริง
* ต้องมองว่าข้อมูลจากแต่ละหน่วยงานอาจไม่เท่ากัน
* ต้องรองรับ blank / partial data / fallback
* ต้องไม่ยึดว่าทุกที่มี table เหมือนกัน
* ต้องเน้นว่าเรากำลังสร้างระบบกลางของเราเอง
* หลีกเลี่ยงการบอกให้ใช้ Keycloak
* ใช้ภาษาไทย
* ตอบให้ละเอียดพอสำหรับส่งต่อ agent/developer ได้ทันที
