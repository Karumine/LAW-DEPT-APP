import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Dropdown } from 'react-bootstrap';
import CRMSidebar from '../components/CRMSidebar'; // Assuming CRMSidebar is in ../components
import { User, Building, Mail, Phone, MapPin, FileText, Calendar, Globe, Twitter, MessageSquare } from 'lucide-react'; // Lucide icons for form fields

export default function CRMContactForm() {
    const { contactId } = useParams(); // Get contactId from URL for edit mode (camelCase)
    const navigate = useNavigate();

    // Initial form data state, aligned with C# Contact Model (PascalCase for backend properties)
    const [formData, setFormData] = useState({
        // ข้อมูลผู้ติดต่อ (Contact Information) - เปลี่ยนจาก "ข้อมูลบัญชี"
        Owner: 'Supap Nonkaew', // เจ้าของบัญชี
        Prefix: 'None', // คำนำหน้า
        FirstName: '', // ชื่อ (ผู้ติดต่อหลัก)
        LastName: '', // นามสกุล
        AccountName: '', // ชื่อผู้ติดต่อ (เปลี่ยนจาก AccountName เพื่อให้ตรงกับแนวคิด Contact)
        Email: '', // อีเมล
        Phone: '', // โทรศัพท์
        OtherPhone: '', // โทรศัพท์อื่นๆ
        Mobile: '', // โทรศัพท์มือถือ
        Assistant: '', // ผู้ช่วย

        // ข้อมูลเพิ่มเติม (Additional Information)
        LeadSource: 'None', // แหล่งที่มาลูกค้ามุ่งหวัง
        SalespersonName: '', // ชื่อผู้ขาย
        Department: '', // แผนก
        HomePhone: '', // โทรศัพท์บ้าน
        Fax: '', // แฟกซ์
        DateOfBirth: '', // วันเกิด (เก็บเป็น string YYYY-MM-DD)
        AssistantPhone: '', // โทรศัพท์ของผู้ช่วย
        OptOutEmail: false, // เลือกไม่รับอีเมล (boolean)
        SkypeID: '', // ไลน์ Skype
        SecondaryEmail: '', // อีเมลสำรอง
        Twitter: '', // Twitter
        Supervisor: '', // ผู้บังคับบัญชา
        Title: '', // ตำแหน่งงาน

        // ข้อมูลที่อยู่ (Address Information) - Delivery Address
        DeliveryStreet: '', // ถนนที่จัดส่ง
        DeliveryDistrict: '', // อำเภอที่จัดส่ง
        DeliveryProvince: '', // จังหวัดที่จัดส่ง
        DeliveryZipCode: '', // รหัสไปรษณีย์ที่จัดส่ง
        DeliveryCountry: '', // ประเทศที่จัดส่ง
        // Other Address
        OtherStreet: '', // ถนนอื่น
        OtherDistrict: '', // อำเภออื่น
        OtherProvince: '', // จังหวัดอื่น
        OtherZipCode: '', // รหัสไปรษณีย์อื่นๆ
        OtherCountry: '', // ประเทศอื่น

        // ข้อมูลคำอธิบาย (Description Information)
        Description: '', // คำอธิบาย
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // API endpoint for contacts
    const API_URL = "https://localhost:7274/api/contacts"; 

    // Fetch existing data for edit mode
    useEffect(() => {
        console.log("[CRMContactForm] useEffect triggered. contactId:", contactId);
        if (contactId) { // Check if contactId exists for edit mode
            setLoading(true);
            setError(null);
            const fetchContact = async () => {
                try {
                    console.log(`[CRMContactForm] Fetching contact data from: ${API_URL}/${contactId}`);
                    const response = await fetch(`${API_URL}/${contactId}`);

                    if (!response.ok) {
                        let errorDetails = `Failed to fetch contact: ${response.status}`;
                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                            try {
                                const errorData = await response.json();
                                errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                            } catch (jsonError) {
                                errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                                console.error("[CRMContactForm] Failed to parse JSON error response:", jsonError);
                            }
                        } else {
                            errorDetails = await response.text();
                            console.error("[CRMContactForm] Non-JSON error response:", errorDetails);
                        }
                        throw new Error(errorDetails);
                    }
                    const rawData = await response.json();
                    console.log("Fetched raw contact data for edit:", rawData);

                    // --- START: Transformation from camelCase to PascalCase ---
                    const transformedData = {};
                    for (const key in rawData) {
                        if (Object.prototype.hasOwnProperty.call(rawData, key)) {
                            // Convert first letter to uppercase
                            const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                            transformedData[pascalKey] = rawData[key];
                        }
                    }
                    // --- END: Transformation ---

                    // Format DateOfBirth for input type="date" (now using the PascalCase key)
                    if (transformedData.DateOfBirth) { 
                        transformedData.DateOfBirth = new Date(transformedData.DateOfBirth).toISOString().split('T')[0];
                    }

                    // Handle boolean fields if necessary (e.g., OptOutEmail)
                    // Ensure it's a boolean, as backend might send 0/1 or string "true"/"false"
                    if (typeof transformedData.OptOutEmail !== 'boolean') {
                        transformedData.OptOutEmail = transformedData.OptOutEmail === true || transformedData.OptOutEmail === 1 || transformedData.OptOutEmail === 'true';
                    }


                    setFormData(transformedData);
                    console.log("formData state updated with (transformed):", transformedData); // Log the transformed data
                } catch (err) {
                    console.error("Failed to load contact data:", err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchContact();
        } else {
            console.log("[CRMContactForm] No contactId, starting in create new mode.");
            setLoading(false); // No ID, so it's a new form, no loading needed
        }
    }, [contactId]); // Dependency on contactId (camelCase)

    // Handle input changes for form fields
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle dropdown selections
    const handleDropdownSelect = (name, value) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle copying delivery address to other address
    const handleCopyAddress = () => {
        setFormData(prevData => ({
            ...prevData,
            OtherStreet: prevData.DeliveryStreet,
            OtherDistrict: prevData.DeliveryDistrict,
            OtherProvince: prevData.DeliveryProvince,
            OtherZipCode: prevData.DeliveryZipCode,
            OtherCountry: prevData.DeliveryCountry,
        }));
    };

    // Handle form submission (Save or Save and New)
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        const submitter = e.nativeEvent.submitter;
        const saveAndNew = submitter && submitter.getAttribute('data-savenew') === 'true';

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        // Basic client-side validation
        if (!formData.AccountName.trim()) { // เปลี่ยนจาก AccountName เป็น AccountName
            setSaveError("กรุณากรอกชื่อผู้ติดต่อ"); // เปลี่ยนข้อความ
            setIsSaving(false);
            return;
        }
        if (!formData.FirstName.trim()) {
            setSaveError("กรุณากรอกชื่อผู้ติดต่อ");
            setIsSaving(false);
            return;
        }
        if (!formData.Email.trim()) {
            setSaveError("กรุณากรอกอีเมล");
            setIsSaving(false);
            return;
        }

        console.log("Submitting form data:", formData);

        try {
            const method = contactId ? 'PUT' : 'POST';
            const url = contactId ? `${API_URL}/${contactId}` : API_URL;

            // Prepare data for backend (ensure PascalCase for properties)
            const dataToSend = {
                ...formData,
                Id: contactId ? parseInt(contactId) : 0, // Include Id for PUT requests
                // Ensure DateOfBirth is formatted as YYYY-MM-DD or null
                DateOfBirth: formData.DateOfBirth ? formData.DateOfBirth : null,
                // Ensure OptOutEmail is boolean
                OptOutEmail: Boolean(formData.OptOutEmail)
            };

            console.log("Sending data to API:", dataToSend);

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.detail || errorJson.title || errorJson.message || errorMessage;
                } catch (parseError) {
                    errorMessage += `: ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            setSaveSuccess(true);
            console.log("Contact saved successfully!");

            setTimeout(() => {
                if (saveAndNew) {
                    // Reset form for new entry
                    setFormData({
                        Owner: 'Supap Nonkaew',
                        Prefix: 'None',
                        FirstName: '',
                        LastName: '',
                        AccountName: '', 
                        Email: '',
                        Phone: '',
                        OtherPhone: '',
                        Mobile: '',
                        Assistant: '',
                        LeadSource: 'None',
                        SalespersonName: '',
                        Department: '',
                        HomePhone: '',
                        Fax: '',
                        DateOfBirth: '',
                        AssistantPhone: '',
                        OptOutEmail: false,
                        SkypeID: '',
                        SecondaryEmail: '',
                        Twitter: '',
                        Supervisor: '',
                        Title: '',
                        DeliveryStreet: '',
                        DeliveryDistrict: '',
                        DeliveryProvince: '',
                        DeliveryZipCode: '',
                        DeliveryCountry: '',
                        OtherStreet: '',
                        OtherDistrict: '',
                        OtherProvince: '',
                        OtherZipCode: '',
                        OtherCountry: '',
                        Description: '',
                    });
                    setSaveSuccess(false); // Clear success message for new form
                    navigate('/crm-contacts/Form'); // Ensure URL reflects new mode
                } else {
                    navigate('/crm-contacts'); // Navigate back to contact list after save
                }
            }, 1500);

        } catch (err) {
            setSaveError(err.message);
            console.error("Error saving contact:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-2">กำลังโหลดข้อมูลผู้ติดต่อ...</p>
            </div>
        );
    }

    return (
        <div className="d-flex" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
            {/* Sidebar - flex-shrink-0 ensures it doesn't shrink, fixed position for no scroll */}
            <CRMSidebar className="flex-shrink-0" style={{ position: 'fixed', height: '100vh', overflowY: 'auto' }} />

            {/* Main content area, takes remaining space */}
            <div className="flex-grow-1 d-flex flex-column" style={{ maxHeight: "100vh" }}> {/* อย่าใส่ marginleft*/ }
                {/* Fixed Header with Title and Buttons */}
                <div className="flex-shrink-0 p-4 d-flex justify-content-between align-items-center" style={{ background: "#f3f7fb", zIndex: 1, position: 'sticky', top: 0 }}>
                    <h2 className="fw-bold mb-0" style={{ color: "#8a2be2" }}> {/* mb-0 to remove bottom margin */}
                        {contactId ? 'แก้ไขผู้ติดต่อ' : 'สร้างผู้ติดต่อ'}
                    </h2>
                    <div className="d-flex gap-2"> {/* Buttons group */}
                        {isSaving && (
                            <div className="d-flex align-items-center me-3 text-primary">
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                กำลังบันทึก...
                            </div>
                        )}
                        {saveError && (
                            <div className="text-danger me-3">
                                <p className="mb-0">เกิดข้อผิดพลาด: {saveError}</p>
                            </div>
                        )}
                        {saveSuccess && (
                            <div className="text-success me-3">
                                <p className="mb-0">บันทึกข้อมูลสำเร็จ!</p>
                            </div>
                        )}
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
                            onClick={() => navigate('/crm-contacts')} // Go back to contacts list
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "translateX(-3px)";
                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "translateX(0)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                            }}
                        >
                            ยกเลิก
                        </button>
                        <Button
                            type="submit" // This button will trigger the form's onSubmit
                            form="contactForm" // Associate button with the form using its ID
                            data-savenew="true" // Custom attribute to indicate "Save and New"
                            className="btn btn-sm px-3 py-2 rounded-3 shadow-sm btn-hover-save"
                            style={{
                                background: "linear-gradient(45deg, #98fb98, #66cdaa)",
                                borderColor: "#98fb98",
                                color: "#36454F",
                                transition: "all 0.3s ease",
                            }}
                            disabled={isSaving}
                        >
                            บันทึกและสร้างใหม่
                        </Button>
                        <Button
                            type="submit" // This button will trigger the form's onSubmit
                            form="contactForm" // Associate button with the form using its ID
                            data-savenew="false" // Custom attribute to indicate "Save"
                            className="btn btn-sm px-3 py-2 rounded-3 shadow-sm btn-hover-save"
                            style={{
                                background: "linear-gradient(45deg, #6a5acd, #8a2be2)",
                                borderColor: "#6a5acd",
                                color: "white",
                                transition: "all 0.3s ease",
                            }}
                            disabled={isSaving}
                        >
                            บันทึก
                        </Button>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                {/* Attach handleSubmit to the form's onSubmit event */}
                <Form onSubmit={handleSubmit} id="contactForm" className="flex-grow-1 overflow-auto p-4 pt-0"> {/* Added pt-0 to remove top padding, as header is now sticky */}
                    {/* Combined Card for Contact Information and Additional Information */}
                    <Card className="shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                        <Card.Body className="p-4">
                            <Row className="g-4">
                                {/* Column 1: ข้อมูลผู้ติดต่อ (Contact Information) - เปลี่ยนจาก "ข้อมูลบัญชี" */}
                                <Col md={6}>
                                    <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                        <User size={20} className="me-2 text-primary" />ข้อมูลผู้ติดต่อ {/* เปลี่ยนข้อความ */}
                                    </h5>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">เจ้าของบัญชี:</Form.Label>
                                        <Dropdown onSelect={(value) => handleDropdownSelect('Owner', value)}>
                                            <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start rounded-3" style={{ borderColor: "#c2e9fb", color: '#6c757d' }}>
                                                {formData.Owner}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="rounded-3 shadow-sm">
                                                <Dropdown.Item eventKey="Supap Nonkaew">Supap Nonkaew</Dropdown.Item>
                                                {/* Add more owners here */}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Form.Group>

                                    {/* Group for Prefix and First Name - now in left column */}
                                    <Row className="g-3 mb-3">
                                        <Col md={4}> {/* Adjusted to md={4} for smaller prefix */}
                                            <Form.Group>
                                                <Form.Label className="fw-bold text-muted">คำนำหน้า:</Form.Label>
                                                <Dropdown onSelect={(value) => handleDropdownSelect('Prefix', value)}>
                                                    <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start rounded-3" style={{ borderColor: "#c2e9fb", color: '#6c757d' }}>
                                                        {formData.Prefix}
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="rounded-3 shadow-sm">
                                                        <Dropdown.Item eventKey="None">None</Dropdown.Item>
                                                        <Dropdown.Item eventKey="นาย">นาย</Dropdown.Item>
                                                        <Dropdown.Item eventKey="นาง">นาง</Dropdown.Item>
                                                        <Dropdown.Item eventKey="นางสาว">นางสาว</Dropdown.Item>
                                                        {/* Add more prefixes */}
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </Form.Group>
                                        </Col>
                                        <Col md={8}> {/* Adjusted to md={8} for first name */}
                                            <Form.Group>
                                                <Form.Label className="fw-bold text-muted">ชื่อ:</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="FirstName"
                                                    value={formData.FirstName}
                                                    onChange={handleChange}
                                                    placeholder="กรอกชื่อ"
                                                    className="rounded-3"
                                                    style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                                    required // Make First Name required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ชื่อบัญชี:</Form.Label> {/* เปลี่ยนข้อความ */}
                                        <Form.Control
                                            type="text"
                                            name="AccountName" // เปลี่ยนจาก AccountName เป็น AccountName
                                            value={formData.AccountName} // เปลี่ยนจาก AccountName เป็น AccountName
                                            onChange={handleChange}
                                            placeholder="กรอกชื่อบัญชี" // เปลี่ยนข้อความ
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                            required // Make Contact Name required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">อีเมล:</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="Email"
                                            value={formData.Email}
                                            onChange={handleChange}
                                            placeholder="กรอกอีเมล"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                            required // Make Email required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">โทรศัพท์:</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="Phone"
                                            value={formData.Phone}
                                            onChange={handleChange}
                                            placeholder="กรอกเบอร์โทรศัพท์"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">โทรศัพท์อื่นๆ:</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="OtherPhone"
                                            value={formData.OtherPhone}
                                            onChange={handleChange}
                                            placeholder="กรอกเบอร์โทรศัพท์อื่นๆ"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">โทรศัพท์มือถือ:</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="Mobile"
                                            value={formData.Mobile}
                                            onChange={handleChange}
                                            placeholder="กรอกเบอร์โทรศัพท์มือถือ"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ผู้ช่วย:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Assistant"
                                            value={formData.Assistant}
                                            onChange={handleChange}
                                            placeholder="กรอกชื่อผู้ช่วย"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Column 2: ข้อมูลเพิ่มเติม (Additional Information) */}
                                <Col md={6}>
                                    <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                        <FileText size={20} className="me-2 text-success" />ข้อมูลเพิ่มเติม
                                    </h5>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">แหล่งที่มาลูกค้ามุ่งหวัง:</Form.Label>
                                        <Dropdown onSelect={(value) => handleDropdownSelect('LeadSource', value)}>
                                            <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start rounded-3" style={{ borderColor: "#c2e9fb", color: '#6c757d' }}>
                                                {formData.LeadSource}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="rounded-3 shadow-sm">
                                                <Dropdown.Item eventKey="None">None</Dropdown.Item>
                                                <Dropdown.Item eventKey="การโฆษณา">การโฆษณา</Dropdown.Item>
                                                <Dropdown.Item eventKey="โทรนัดลูกค้าใหม่ที่ยังไม่รู้จัก">โทรนัดลูกค้าใหม่ที่ยังไม่รู้จัก</Dropdown.Item>
                                                <Dropdown.Item eventKey="การแนะนำของพนักงาน">การแนะนำของพนักงาน</Dropdown.Item>
                                                <Dropdown.Item eventKey="การแนะนำจากภายนอก">การแนะนำจากภายนอก</Dropdown.Item>
                                                <Dropdown.Item eventKey="ร้านค้าออนไลน์">ร้านค้าออนไลน์</Dropdown.Item>
                                                <Dropdown.Item eventKey="พาร์ทเนอร์">พาร์ทเนอร์</Dropdown.Item>
                                                <Dropdown.Item eventKey="Online Store">Online Store</Dropdown.Item>
                                                {/* Add more lead sources */}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Form.Group>

                                    {/* Last Name field - now standalone in right column */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">นามสกุล:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="LastName"
                                            value={formData.LastName}
                                            onChange={handleChange}
                                            placeholder="กรอกนามสกุล"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ชื่อผู้ขาย:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="SalespersonName"
                                            value={formData.SalespersonName}
                                            onChange={handleChange}
                                            placeholder="กรอกชื่อผู้ขาย"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">แผนก:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Department"
                                            value={formData.Department}
                                            onChange={handleChange}
                                            placeholder="กรอกแผนก"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">โทรศัพท์บ้าน:</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="HomePhone"
                                            value={formData.HomePhone}
                                            onChange={handleChange}
                                            placeholder="กรอกเบอร์โทรศัพท์บ้าน"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">แฟกซ์:</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="Fax"
                                            value={formData.Fax}
                                            onChange={handleChange}
                                            placeholder="กรอกเบอร์แฟกซ์"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">วันเกิด:</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="DateOfBirth"
                                            value={formData.DateOfBirth}
                                            onChange={handleChange}
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">โทรศัพท์ของผู้ช่วย:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="AssistantPhone"
                                            value={formData.AssistantPhone}
                                            onChange={handleChange}
                                            placeholder="กรอกเบอร์โทรศัพท์ผู้ช่วย"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            id="optOutEmailCheck"
                                            name="OptOutEmail"
                                            label="เลือกไม่รับอีเมล"
                                            checked={formData.OptOutEmail}
                                            onChange={handleChange}
                                            className="form-check-input-custom"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ไอดี Skype:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="SkypeID"
                                            value={formData.SkypeID}
                                            onChange={handleChange}
                                            placeholder="กรอก Skype ID"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">อีเมลสำรอง:</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="SecondaryEmail"
                                            value={formData.SecondaryEmail}
                                            onChange={handleChange}
                                            placeholder="กรอกอีเมลสำรอง"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">Twitter:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Twitter"
                                            value={formData.Twitter}
                                            onChange={handleChange}
                                            placeholder="กรอก Twitter Handle"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ผู้บังคับบัญชา:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Supervisor"
                                            value={formData.Supervisor}
                                            onChange={handleChange}
                                            placeholder="กรอกชื่อผู้บังคับบัญชา"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ตำแหน่งงาน:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Title"
                                            value={formData.Title}
                                            onChange={handleChange}
                                            placeholder="กรอกตำแหน่งงาน"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* ข้อมูลที่อยู่ (Address Information) */}
                    <Card className="shadow-lg rounded-4 border-0 mt-4" style={{ backgroundColor: "#fdfdff" }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                <MapPin size={20} className="me-2 text-warning" />ข้อมูลที่อยู่
                            </h5>
                            <Row className="g-4">
                                {/* ที่อยู่สำหรับส่งบิล (Delivery Address) */}
                                <Col md={6}>
                                    <h6 className="fw-bold mb-3 text-secondary">ที่อยู่สำหรับส่งบิล</h6>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ถนน:</Form.Label>
                                        <Form.Control as="textarea" rows={3}
                                            name="DeliveryStreet"
                                            value={formData.DeliveryStreet}
                                            onChange={handleChange}
                                            placeholder="กรอกถนน"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">อำเภอ:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="DeliveryDistrict"
                                            value={formData.DeliveryDistrict}
                                            onChange={handleChange}
                                            placeholder="กรอกอำเภอ"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">จังหวัด:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="DeliveryProvince"
                                            value={formData.DeliveryProvince}
                                            onChange={handleChange}
                                            placeholder="กรอกจังหวัด"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">รหัสไปรษณีย์:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="DeliveryZipCode"
                                            value={formData.DeliveryZipCode}
                                            onChange={handleChange}
                                            placeholder="กรอกรหัสไปรษณีย์"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ประเทศ:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="DeliveryCountry"
                                            value={formData.DeliveryCountry}
                                            onChange={handleChange}
                                            placeholder="กรอกประเทศ"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                </Col>

                                {/* ที่อยู่สำหรับจัดส่ง (Other Address) */}
                                <Col md={6}>
                                    <h6 className="fw-bold mb-3 text-secondary">ที่อยู่สำหรับจัดส่ง</h6>
                                    <Button
                                        variant="outline-info"
                                        className="mb-3 w-100 rounded-3"
                                        onClick={handleCopyAddress}
                                        style={{ borderColor: "#c2e9fb", color: "#6a5acd" }}
                                    >
                                        คัดลอกที่อยู่
                                    </Button>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ถนน:</Form.Label>
                                        <Form.Control as="textarea" rows={3}
                                            name="OtherStreet"
                                            value={formData.OtherStreet}
                                            onChange={handleChange}
                                            placeholder="กรอกถนน"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">อำเภอ:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="OtherDistrict"
                                            value={formData.OtherDistrict}
                                            onChange={handleChange}
                                            placeholder="กรอกอำเภอ"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">จังหวัด:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="OtherProvince"
                                            value={formData.OtherProvince}
                                            onChange={handleChange}
                                            placeholder="กรอกจังหวัด"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">รหัสไปรษณีย์:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="OtherZipCode"
                                            value={formData.OtherZipCode}
                                            onChange={handleChange}
                                            placeholder="กรอกรหัสไปรษณีย์"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ประเทศ:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="OtherCountry"
                                            value={formData.OtherCountry}
                                            onChange={handleChange}
                                            placeholder="กรอกประเทศ"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* ข้อมูลคำอธิบาย (Description Information) */}
                    <Card className="shadow-lg rounded-4 border-0 mt-4 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                <FileText size={20} className="me-2 text-info" />ข้อมูลคำอธิบาย
                            </h5>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-muted">คำอธิบาย:</Form.Label>
                                <Form.Control as="textarea" rows={5}
                                    name="Description"
                                    value={formData.Description}
                                    onChange={handleChange}
                                    placeholder="กรอกคำอธิบายเพิ่มเติม"
                                    className="rounded-3"
                                    style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Form>
            </div>
        </div>
    );
}
