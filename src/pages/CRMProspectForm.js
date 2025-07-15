import React, { useState, useEffect } from "react"; // import useEffect
import { useNavigate, useParams } from "react-router-dom"; // import useParams
import CRMSidebar from "../components/CRMSidebar";

export default function CRMProspectForm() {
  const navigate = useNavigate();
  const { leadID } = useParams(); // ดึง leadID จาก URL (จะเป็น undefined ถ้าไม่มีใน URL)

  const [formData, setFormData] = useState({
    owner: "Supap Nonikaew",
    companyName: "",
    salutation: "-None-",
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    fax: "",
    phone: "",
    website: "",
    mobilePhone: "",
    leadStatus: "-None-",
    leadSource: "-None-",
    numEmployees: "",
    industry: "-None-",
    rating: "-None-",
    annualRevenue: "",
    lineID: "",
    skypeID: "",
    doNotContact: false,
    alternateEmail: "",
    twitter: "",
    street: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    description: "",
  });

  const [loadingForm, setLoadingForm] = useState(true); // เพิ่ม state สำหรับการโหลดข้อมูลฟอร์ม
  const [submitLoading, setSubmitLoading] = useState(false); // เพิ่ม state สำหรับตอน submit
  const [error, setError] = useState(null);

  const API_URL = "https://localhost:7274/api/leads";

  // Effect สำหรับโหลดข้อมูลเมื่อ leadID เปลี่ยน (เข้าสู่โหมดแก้ไข)
  useEffect(() => {
    const fetchLeadData = async () => {
      if (leadID) {
        setLoadingForm(true);
        setError(null);
        try {
          const response = await fetch(`${API_URL}/${leadID}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.message || 'Failed to fetch lead data.');
          }
          const data = await response.json();
          // ตั้งค่าข้อมูลที่ดึงมาลงใน formData
          setFormData({
            ...data,
            numEmployees: data.numEmployees ? String(data.numEmployees) : "", // แปลง number เป็น string สำหรับ input
            annualRevenue: data.annualRevenue ? String(data.annualRevenue) : "", // แปลง number เป็น string สำหรับ input
          });
        } catch (err) {
          console.error("Error fetching lead data:", err);
          setError(err.message);
        } finally {
          setLoadingForm(false);
        }
      } else {
        // ถ้าไม่มี leadID (โหมดสร้างใหม่) ให้รีเซ็ตฟอร์มเป็นค่าเริ่มต้น
        setFormData({
          owner: "Supap Nonikaew",
          companyName: "",
          salutation: "-None-",
          firstName: "",
          lastName: "",
          email: "",
          jobTitle: "",
          fax: "",
          phone: "",
          website: "",
          mobilePhone: "",
          leadStatus: "-None-",
          leadSource: "-None-",
          numEmployees: "",
          industry: "-None-",
          rating: "-None-",
          annualRevenue: "",
          lineID: "",
          skypeID: "",
          doNotContact: false,
          alternateEmail: "",
          twitter: "",
          street: "",
          city: "",
          stateProvince: "",
          postalCode: "",
          country: "",
          description: "",
        });
        setLoadingForm(false); // หยุด loading เพราะเป็นค่าเริ่มต้น
      }
    };

    fetchLeadData();
  }, [leadID]); // ให้ effect ทำงานใหม่เมื่อ leadID เปลี่ยน

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (action) => {
    setSubmitLoading(true);
    setError(null);
    try {
      const dataToSend = {
        ...formData,
        numEmployees: formData.numEmployees === "" ? null : parseInt(formData.numEmployees, 10),
        annualRevenue: formData.annualRevenue === "" ? null : parseFloat(formData.annualRevenue),
      };

      const method = leadID ? 'PUT' : 'POST';
      const url = leadID ? `${API_URL}/${leadID}` : API_URL;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      let savedLead = {}; // กำหนดค่าเริ่มต้นเป็น object เปล่า
      // ตรวจสอบ Content-Type ก่อนพยายามอ่าน JSON
      const contentType = response.headers.get("content-type");

      if (response.ok) { // ถ้าสถานะเป็น 2xx (สำเร็จ)
        if (contentType && contentType.includes("application/json")) {
          try {
            savedLead = await response.json(); // พยายามอ่าน JSON
            console.log('Lead saved successfully (with JSON response):', savedLead);
          } catch (jsonParseError) {
            // ถ้า Backend บอกว่าเป็น JSON แต่ parse ไม่ได้ (เช่น JSON ว่างเปล่า)
            console.warn('Backend returned non-parseable JSON despite success status:', jsonParseError);
            // สามารถอ่านเป็น text แทนได้ถ้าต้องการเห็นเนื้อหา
            const responseText = await response.text();
            console.warn('Raw response text:', responseText);
          }
        } else {
          // ถ้า Backend ไม่ได้ส่ง Content-Type เป็น JSON (เช่นส่งว่างเปล่า)
          console.log('Lead saved successfully, but backend did not return JSON. Status:', response.status);
          // สามารถอ่านเป็น text ได้ถ้าอยากดูอะไรที่ Backend ส่งกลับมา
          const responseText = await response.text();
          console.log('Raw successful response text:', responseText);
        }

        if (action === "save") {
          alert(leadID ? "บันทึกการแก้ไขลูกค้ามุ่งหวังแล้ว!" : "บันทึกข้อมูลลูกค้ามุ่งหวังแล้ว!");
          navigate("/crm-prospects");
        } else if (action === "saveAndNew") {
          alert(leadID ? "บันทึกการแก้ไขและสร้างลูกค้ามุ่งหวังใหม่!" : "บันทึกข้อมูลและสร้างลูกค้ามุ่งหวังใหม่!");
          setFormData({
            // ... reset form data ...
            owner: "Supap Nonikaew", companyName: "", salutation: "-None-", firstName: "", lastName: "", email: "", jobTitle: "", fax: "", phone: "", website: "", mobilePhone: "", leadStatus: "-None-", leadSource: "-None-", numEmployees: "", industry: "-None-", rating: "-None-", annualRevenue: "", lineID: "", skypeID: "", doNotContact: false, alternateEmail: "", twitter: "", street: "", city: "", stateProvince: "", postalCode: "", country: "", description: "",
          });
          navigate("/crm-prospect-form");
        }
      } else { // ถ้าสถานะเป็น Error (4xx, 5xx)
        let errorData = { message: 'Unknown error occurred on server.' };
        if (contentType && contentType.includes("application/json")) {
          try {
            errorData = await response.json(); // พยายามอ่าน JSON error
          } catch (jsonParseError) {
            console.warn('Backend returned non-parseable JSON error:', jsonParseError);
            errorData.message = await response.text() || 'Failed to parse error response.';
          }
        } else {
          errorData.message = await response.text() || 'Server returned an error without JSON.';
        }
        const errorMessage = errorData.detail || errorData.message || 'Failed to save lead.';
        console.error('เกิดข้อผิดพลาดในการบันทึก:', errorMessage);
        throw new Error(errorMessage); // โยน Error เพื่อให้ไปจับใน catch
      }

    } catch (err) {
      console.error('Error saving lead:', err);
      setError(err.message);
      alert(`เกิดข้อผิดพลาดในการบันทึก: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  // แสดง Loading State ขณะที่กำลังดึงข้อมูลมาเติมฟอร์ม (เฉพาะตอนที่เข้ามาแก้ไข)
  if (loadingForm && leadID) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-2">กำลังโหลดข้อมูลลูกค้ามุ่งหวัง...</p>
      </div>
    );
  }

  // แสดง Error State หากโหลดข้อมูลไม่สำเร็จ
  if (error && leadID) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
        <p className="text-danger mb-2">ข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>กลับ</button>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
      <CRMSidebar className="flex-shrink-0" />

      <div className="flex-grow-1 d-flex flex-column" style={{ maxHeight: "100vh" }}>
        <div className="container-fluid py-4 flex-shrink-0" style={{ background: "#f3f7fb", zIndex: 1, position: "sticky", top: 0 }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold" style={{ color: "#8a2be2" }}>
              {leadID ? "✏️ แก้ไขลูกค้ามุ่งหวัง" : "📝 สร้างลูกค้ามุ่งหวัง"} {/* เปลี่ยนหัวข้อตามโหมด */}
            </h4>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm px-3 py-2 rounded-3 shadow-sm btn-hover-back"
                style={{
                  background: "linear-gradient(45deg, #add8e6, #87ceeb)",
                  borderColor: "#add8e6",
                  color: "#36454F",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
                onClick={handleGoBack}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateX(-3px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
                disabled={submitLoading} // ปิดปุ่มเมื่อกำลัง submit
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-sm px-3 py-2 rounded-3 shadow-sm btn-hover-save"
                style={{
                  background: "linear-gradient(45deg, #98fb98, #66cdaa)",
                  borderColor: "#98fb98",
                  color: "#36454F",
                  transition: "all 0.3s ease",
                }}
                onClick={() => handleSubmit("saveAndNew")}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
                }}
                disabled={submitLoading || leadID} // ปิดปุ่ม "บันทึกและสร้างใหม่" ในโหมดแก้ไข
              >
                บันทึกและสร้างใหม่
              </button>
              <button
                className="btn btn-sm px-3 py-2 rounded-3 shadow-sm btn-hover-save"
                style={{
                  background: "linear-gradient(45deg, #6a5acd, #8a2be2)",
                  borderColor: "#6a5acd",
                  color: "white",
                  transition: "all 0.3s ease",
                }}
                onClick={() => handleSubmit("save")}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
                }}
                disabled={submitLoading} // ปิดปุ่มเมื่อกำลัง submit
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow-1 overflow-auto px-4" style={{ paddingBottom: '2rem' }}>
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8">
              <div className="card p-4 shadow-lg rounded-4 border-0 fade-in" style={{ backgroundColor: "#fdfdff" }}>

                <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>รูปภาพลูกค้ามุ่งหวัง</h5>
                <div className="mb-4 d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "#e0eaff",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "2.5rem",
                      color: "#6a5acd",
                      border: "2px solid #c2e9fb",
                    }}
                  >
                    👤
                  </div>
                </div>

                <h5 className="fw-bold mb-3 mt-4" style={{ color: "#6a5acd" }}>ข้อมูลลูกค้ามุ่งหวัง</h5>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label htmlFor="owner" className="form-label">เจ้าของลูกค้ามุ่งหวัง</label>
                    <select
                      id="owner"
                      name="owner"
                      className="form-select rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.owner}
                      onChange={handleChange}
                    >
                      <option value="Supap Nonikaew">Supap Nonikaew</option>
                      {/* Add other options as needed */}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="companyName" className="form-label">บริษัท</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">ชื่อ</label>
                    <div className="d-flex gap-2">
                      <select
                        id="salutation"
                        name="salutation"
                        className="form-select rounded-3 flex-grow-0"
                        style={{ borderColor: "#c2e9fb", width: 'auto' }}
                        value={formData.salutation}
                        onChange={handleChange}
                      >
                        <option value="-None-">-None-</option>
                        <option value="นาย">นาย</option>
                        <option value="นาง">นาง</option>
                        <option value="นางสาว">นางสาว</option>
                      </select>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="form-control rounded-3 flex-grow-1"
                        style={{ borderColor: "#c2e9fb" }}
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">นามสกุล</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">อีเมล</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="jobTitle" className="form-label">ตำแหน่งงาน</label>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.jobTitle}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="fax" className="form-label">แฟกซ์</label>
                    <input
                      type="text"
                      id="fax"
                      name="fax"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.fax}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label">โทรศัพท์</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="website" className="form-label">เว็บไซต์</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="mobilePhone" className="form-label">โทรศัพท์มือถือ</label>
                    <input
                      type="tel"
                      id="mobilePhone"
                      name="mobilePhone"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.mobilePhone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="leadStatus" className="form-label">สถานะลูกค้ามุ่งหวัง</label>
                    <select
                      id="leadStatus"
                      name="leadStatus"
                      className="form-select rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.leadStatus}
                      onChange={handleChange}
                    >
                      <option value="-None-">-None-</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option> {/* เพิ่ม Qualified */}
                      <option value="Needs Action">Needs Action</option>
                      <option value="Untouched">Untouched</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="leadSource" className="form-label">แหล่งที่มาลูกค้ามุ่งหวัง</label>
                    <select
                      id="leadSource"
                      name="leadSource"
                      className="form-select rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.leadSource}
                      onChange={handleChange}
                    >
                      <option value="-None-">-None-</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Advertisement">Advertisement</option>
                      <option value="Web Download">Web Download</option>
                      <option value="Seminar Partner">Seminar Partner</option>
                      <option value="Online Store">Online Store</option>
                      <option value="External Referral">External Referral</option>
                      <option value="Partnership">Partnership</option> {/* เพิ่ม Partnership */}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="numEmployees" className="form-label">จำนวนพนักงาน</label>
                    <input
                      type="number"
                      id="numEmployees"
                      name="numEmployees"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.numEmployees}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="industry" className="form-label">อุตสาหกรรม</label>
                    <select
                      id="industry"
                      name="industry"
                      className="form-select rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.industry}
                      onChange={handleChange}
                    >
                      <option value="-None-">-None-</option>
                      <option value="Technology">Technology</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Service">Service</option>
                      <option value="Software Development">Software Development</option> {/* เพิ่มตามข้อมูลของคุณ */}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="rating" className="form-label">การจัดอันดับ</label>
                    <select
                      id="rating"
                      name="rating"
                      className="form-select rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.rating}
                      onChange={handleChange}
                    >
                      <option value="-None-">-None-</option>
                      <option value="Hot">Hot</option>
                      <option value="Warm">Warm</option>
                      <option value="Cold">Cold</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="annualRevenue" className="form-label">รายได้ต่อปี</label>
                    <input
                      type="number"
                      id="annualRevenue"
                      name="annualRevenue"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.annualRevenue}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lineID" className="form-label">Line ID</label>
                    <input
                      type="text"
                      id="lineID"
                      name="lineID"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.lineID}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="skypeID" className="form-label">Skype ID</label>
                    <input
                      type="text"
                      id="skypeID"
                      name="skypeID"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.skypeID}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="doNotContactCheck"
                        name="doNotContact"
                        checked={formData.doNotContact}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="doNotContactCheck">
                        เลือกไม่ให้ติดต่อ
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="alternateEmail" className="form-label">อีเมลสำรอง</label>
                    <input
                      type="email"
                      id="alternateEmail"
                      name="alternateEmail"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.alternateEmail}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="twitter" className="form-label">Twitter</label>
                    <div className="input-group">
                      <span className="input-group-text rounded-start-3" style={{ borderColor: "#c2e9fb", background: "#e0eaff" }}>@</span>
                      <input
                        type="text"
                        id="twitter"
                        name="twitter"
                        className="form-control rounded-end-3"
                        style={{ borderColor: "#c2e9fb" }}
                        value={formData.twitter}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <h5 className="fw-bold mb-3 mt-4" style={{ color: "#6a5acd" }}>ข้อมูลที่อยู่</h5>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label htmlFor="street" className="form-label">ถนน</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.street}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="city" className="form-label">เมือง</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="stateProvince" className="form-label">รัฐ/จังหวัด</label>
                    <input
                      type="text"
                      id="stateProvince"
                      name="stateProvince"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.stateProvince}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="postalCode" className="form-label">รหัสไปรษณีย์</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.postalCode}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="country" className="form-label">ประเทศ</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      className="form-control rounded-3"
                      style={{ borderColor: "#c2e9fb" }}
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <h5 className="fw-bold mb-3 mt-4" style={{ color: "#6a5acd" }}>ข้อมูลคำอธิบาย</h5>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">คำอธิบาย</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control rounded-3"
                    rows="4"
                    style={{ borderColor: "#c2e9fb" }}
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}