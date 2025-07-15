import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Dropdown } from 'react-bootstrap';
import CRMSidebar from '../components/CRMSidebar';
import { User, Building, Mail, Phone, MapPin, FileText, Calendar, Globe, Twitter, MessageSquare, DollarSign, List, Hash, Briefcase, Star, Percent } from 'lucide-react';

export default function CRMAccountForm() {
    const { accountId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        Owner: 'Supap Nonkaew',
        AccountName: '',
        AccountWebsite: '', // เว็บไซต์บัญชี
        Website: '', // เว็บไซต์ (คอลัมน์ใหม่)
        PrimaryAccount: '',
        AccountNumber: '',
        AccountType: 'None',
        Industry: 'None',
        AnnualRevenue: '',
        Rating: 'None',
        Phone: '',
        Fax: '',
        TickerSymbol: '',
        Employees: '',
        SicCode: '',

        Description: '',

        BillingStreet: '',
        BillingDistrict: '',
        BillingProvince: '',
        BillingZipCode: '',
        BillingCountry: '',
        ShippingStreet: '',
        ShippingDistrict: '',
        ShippingProvince: '',
        ShippingZipCode: '',
        ShippingCountry: '',
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const API_URL = "https://localhost:7274/api/accounts";

    useEffect(() => {
        console.log("[CRMAccountForm] useEffect triggered. accountId:", accountId);
        if (accountId) {
            setLoading(true);
            setError(null);
            const fetchAccount = async () => {
                try {
                    console.log(`[CRMAccountForm] Fetching account data from: ${API_URL}/${accountId}`);
                    const response = await fetch(`${API_URL}/${accountId}`);

                    if (!response.ok) {
                        let errorDetails = `Failed to fetch account: ${response.status}`;
                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                            try {
                                const errorData = await response.json();
                                errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                            } catch (jsonError) {
                                errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                                console.error("[CRMAccountForm] Failed to parse JSON error response:", jsonError);
                            }
                        } else {
                            errorDetails = await response.text();
                            console.error("[CRMAccountForm] Non-JSON error response:", errorDetails);
                        }
                        throw new Error(errorDetails);
                    }
                    const rawData = await response.json();
                    console.log("Fetched raw account data for edit:", rawData);

                    const transformedData = {};
                    for (const key in rawData) {
                        if (Object.prototype.hasOwnProperty.call(rawData, key)) {
                            const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                            transformedData[pascalKey] = rawData[key];
                        }
                    }

                    if (transformedData.AnnualRevenue !== undefined && transformedData.AnnualRevenue !== null) {
                        transformedData.AnnualRevenue = parseFloat(transformedData.AnnualRevenue).toFixed(2);
                    }
                    if (transformedData.Employees !== undefined && transformedData.Employees !== null) {
                        transformedData.Employees = parseInt(transformedData.Employees, 10);
                    }

                    setFormData(prevData => ({ ...prevData, ...transformedData }));
                    console.log("formData state updated with (transformed):", transformedData);
                } catch (err) {
                    console.error("Failed to load account data:", err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchAccount();
        } else {
            console.log("[CRMAccountForm] No accountId, starting in create new mode.");
            setLoading(false);
        }
    }, [accountId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDropdownSelect = (name, value) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleCopyAddress = () => {
        setFormData(prevData => ({
            ...prevData,
            ShippingStreet: prevData.BillingStreet,
            ShippingDistrict: prevData.BillingDistrict,
            ShippingProvince: prevData.BillingProvince,
            ShippingZipCode: prevData.BillingZipCode,
            ShippingCountry: prevData.BillingCountry,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitter = e.nativeEvent.submitter;
        const saveAndNew = submitter && submitter.getAttribute('data-savenew') === 'true';

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        // Client-side validation for required fields
        if (!formData.AccountName.trim()) {
            setSaveError("กรุณากรอกชื่อบัญชี");
            setIsSaving(false);
            return;
        }
        if (!formData.Owner.trim()) {
            setSaveError("กรุณาเลือกเจ้าของบัญชี");
            setIsSaving(false);
            return;
        }

        console.log("Submitting form data:", formData);

        try {
            const method = accountId ? 'PUT' : 'POST';
            const url = accountId ? `${API_URL}/${accountId}` : API_URL;

            const dataToSend = {
                ...formData,
                Id: accountId ? parseInt(accountId) : 0,
                AnnualRevenue: formData.AnnualRevenue ? parseFloat(formData.AnnualRevenue) : null,
                Employees: formData.Employees ? parseInt(formData.Employees, 10) : null,
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
            console.log("Account saved successfully!");

            setTimeout(() => {
                if (saveAndNew) {
                    setFormData({
                        Owner: 'Supap Nonkaew',
                        AccountName: '',
                        AccountWebsite: '',
                        Website: '',
                        PrimaryAccount: '',
                        AccountNumber: '',
                        AccountType: 'None',
                        Industry: 'None',
                        AnnualRevenue: '',
                        Rating: 'None',
                        Phone: '',
                        Fax: '',
                        TickerSymbol: '',
                        Employees: '',
                        SicCode: '',
                        Description: '',
                        BillingStreet: '',
                        BillingDistrict: '',
                        BillingProvince: '',
                        BillingZipCode: '',
                        BillingCountry: '',
                        ShippingStreet: '',
                        ShippingDistrict: '',
                        ShippingProvince: '',
                        ShippingZipCode: '',
                        ShippingCountry: '',
                    });
                    setSaveSuccess(false);
                    navigate('/crm-accounts/Form');
                } else {
                    navigate('/crm-accounts');
                }
            }, 1500);

        } catch (err) {
            setSaveError(err.message);
            console.error("Error saving account:", err);
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
                <p className="ms-2">กำลังโหลดข้อมูลบัญชี...</p>
            </div>
        );
    }

    return (
        <div className="d-flex" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
            <CRMSidebar className="flex-shrink-0" style={{ position: 'fixed', height: '100vh', overflowY: 'auto' }} />

            <div className="flex-grow-1 d-flex flex-column" style={{ maxHeight: "100vh" }}>
                <div className="flex-shrink-0 p-4 d-flex justify-content-between align-items-center" style={{ background: "#f3f7fb", zIndex: 1, position: 'sticky', top: 0 }}>
                    <h2 className="fw-bold mb-0" style={{ color: "#8a2be2" }}>
                        {accountId ? 'แก้ไขบัญชี' : 'สร้างบัญชี'}
                    </h2>
                    <div className="d-flex gap-2">
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
                            onClick={() => navigate('/crm-accounts')}
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
                            type="submit"
                            form="accountForm"
                            data-savenew="true"
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
                            type="submit"
                            form="accountForm"
                            data-savenew="false"
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

                <Form onSubmit={handleSubmit} id="accountForm" className="flex-grow-1 overflow-auto p-4 pt-0">
                    <Card className="shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                        <Card.Body className="p-4">
                            <Row className="g-4">
                                <Col md={6}>
                                    <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                        <User size={20} className="me-2 text-primary" />ข้อมูลบัญชี
                                    </h5>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">เจ้าของบัญชี:</Form.Label>
                                        <Dropdown onSelect={(value) => handleDropdownSelect('Owner', value)}>
                                            <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start rounded-3" style={{ borderColor: "#c2e9fb", color: '#6c757d' }}>
                                                {formData.Owner}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="rounded-3 shadow-sm">
                                                <Dropdown.Item eventKey="Supap Nonkaew">Supap Nonkaew</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ชื่อบัญชี:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="AccountName"
                                            value={formData.AccountName}
                                            onChange={handleChange}
                                            placeholder="กรอกชื่อบัญชี"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">เว็บไซต์บัญชี:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="AccountWebsite"
                                            value={formData.AccountWebsite}
                                            onChange={handleChange}
                                            placeholder="กรอกเว็บไซต์บัญชี"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">เว็บไซต์:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Website"
                                            value={formData.Website}
                                            onChange={handleChange}
                                            placeholder="กรอกเว็บไซต์"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">บัญชีตัวหลัก:</Form.Label>
                                        <div className="input-group">
                                            <Form.Control
                                                type="text"
                                                name="PrimaryAccount"
                                                value={formData.PrimaryAccount}
                                                onChange={handleChange}
                                                placeholder="กรอกบัญชีตัวหลัก"
                                                className="rounded-start-3"
                                                style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                            />
                                            <Button variant="outline-secondary" className="rounded-end-3" style={{ borderColor: "#c2e9fb", color: "#6a5acd" }}>
                                                <List size={18} />
                                            </Button>
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">หมายเลขบัญชี:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="AccountNumber"
                                            value={formData.AccountNumber}
                                            onChange={handleChange}
                                            placeholder="กรอกหมายเลขบัญชี"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ประเภทบัญชี:</Form.Label>
                                        <Dropdown onSelect={(value) => handleDropdownSelect('AccountType', value)}>
                                            <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start rounded-3" style={{ borderColor: "#c2e9fb", color: '#6c757d' }}>
                                                {formData.AccountType}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="rounded-3 shadow-sm">
                                                <Dropdown.Item eventKey="None">None</Dropdown.Item>
                                                <Dropdown.Item eventKey="อื่นๆ">อื่นๆ</Dropdown.Item>
                                                <Dropdown.Item eventKey="ส่วนตัว">ส่วนตัว</Dropdown.Item>
                                                <Dropdown.Item eventKey="สาธารณะ">สาธารณะ</Dropdown.Item>
                                                <Dropdown.Item eventKey="สาขา">สาขา</Dropdown.Item>
                                                <Dropdown.Item eventKey="Partnership">Partnership</Dropdown.Item>
                                                <Dropdown.Item eventKey="Government">Government</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">อุตสาหกรรม:</Form.Label>
                                        <Dropdown onSelect={(value) => handleDropdownSelect('Industry', value)}>
                                            <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start rounded-3" style={{ borderColor: "#c2e9fb", color: '#6c757d' }}>
                                                {formData.Industry}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="rounded-3 shadow-sm">
                                                <Dropdown.Item eventKey="None">None</Dropdown.Item>
                                                <Dropdown.Item eventKey="Agriculture">Agriculture</Dropdown.Item>
                                                <Dropdown.Item eventKey="Banking">Banking</Dropdown.Item>
                                                <Dropdown.Item eventKey="Construction">Construction</Dropdown.Item>
                                                <Dropdown.Item eventKey="Education">Education</Dropdown.Item>
                                                <Dropdown.Item eventKey="Energy">Energy</Dropdown.Item>
                                                <Dropdown.Item eventKey="Healthcare">Healthcare</Dropdown.Item>
                                                <Dropdown.Item eventKey="Manufacturing">Manufacturing</Dropdown.Item>
                                                <Dropdown.Item eventKey="Retail">Retail</Dropdown.Item>
                                                <Dropdown.Item eventKey="Technology">Technology</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">รายได้ต่อปี:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="AnnualRevenue"
                                            value={formData.AnnualRevenue}
                                            onChange={handleChange}
                                            placeholder="กรอกรายได้ต่อปี"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">การจัดอันดับ:</Form.Label>
                                        <Dropdown onSelect={(value) => handleDropdownSelect('Rating', value)}>
                                            <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start rounded-3" style={{ borderColor: "#c2e9fb", color: '#6c757d' }}>
                                                {formData.Rating}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="rounded-3 shadow-sm">
                                                <Dropdown.Item eventKey="None">None</Dropdown.Item>
                                                <Dropdown.Item eventKey="Acquired">Acquired</Dropdown.Item>
                                                <Dropdown.Item eventKey="Active">Active</Dropdown.Item>
                                                <Dropdown.Item eventKey="Market Failed">Market Failed</Dropdown.Item>
                                                <Dropdown.Item eventKey="Project Cancelled">Project Cancelled</Dropdown.Item>
                                                <Dropdown.Item eventKey="Shut Down">Shut Down</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                        <FileText size={20} className="me-2 text-success" />ข้อมูลติดต่อ
                                    </h5>
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
                                        <Form.Label className="fw-bold text-muted">สัญลักษณ์หุ้น:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="TickerSymbol"
                                            value={formData.TickerSymbol}
                                            onChange={handleChange}
                                            placeholder="กรอกสัญลักษณ์หุ้น"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">พนักงาน:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="Employees"
                                            value={formData.Employees}
                                            onChange={handleChange}
                                            placeholder="กรอกจำนวนพนักงาน"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">โค้ด SIC:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="SicCode"
                                            value={formData.SicCode}
                                            onChange={handleChange}
                                            placeholder="กรอกโค้ด SIC"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-lg rounded-4 border-0 mt-4" style={{ backgroundColor: "#fdfdff" }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                <MapPin size={20} className="me-2 text-warning" />ข้อมูลที่อยู่
                            </h5>
                            <Row className="g-4">
                                <Col md={6}>
                                    <h6 className="fw-bold mb-3 text-secondary">ที่อยู่สำหรับเรียกเก็บเงิน</h6>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">ถนน:</Form.Label>
                                        <Form.Control as="textarea" rows={3}
                                            name="BillingStreet"
                                            value={formData.BillingStreet}
                                            onChange={handleChange}
                                            placeholder="กรอกถนน"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">เมือง:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="BillingDistrict"
                                            value={formData.BillingDistrict}
                                            onChange={handleChange}
                                            placeholder="กรอกเมือง"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">จังหวัด:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="BillingProvince"
                                            value={formData.BillingProvince}
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
                                            name="BillingZipCode"
                                            value={formData.BillingZipCode}
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
                                            name="BillingCountry"
                                            value={formData.BillingCountry}
                                            onChange={handleChange}
                                            placeholder="กรอกประเทศ"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                </Col>

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
                                            name="ShippingStreet"
                                            value={formData.ShippingStreet}
                                            onChange={handleChange}
                                            placeholder="กรอกถนน"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">เมือง:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="ShippingDistrict"
                                            value={formData.ShippingDistrict}
                                            onChange={handleChange}
                                            placeholder="กรอกเมือง"
                                            className="rounded-3"
                                            style={{ borderColor: "#c2e9fb", color: '#6c757d' }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold text-muted">จังหวัด:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="ShippingProvince"
                                            value={formData.ShippingProvince}
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
                                            name="ShippingZipCode"
                                            value={formData.ShippingZipCode}
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
                                            name="ShippingCountry"
                                            value={formData.ShippingCountry}
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
