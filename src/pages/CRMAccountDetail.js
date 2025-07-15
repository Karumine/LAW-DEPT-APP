import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Dropdown } from 'react-bootstrap'; // Import necessary Bootstrap components
import CRMSidebar from '../components/CRMSidebar'; // Assuming CRMSidebar is in ../components
import { User, Building, Mail, Phone, MapPin, FileText, Calendar, Globe, Twitter, MessageSquare, Info, Edit, Trash2, ChevronLeft, Building2 } from 'lucide-react'; // Lucide icons for various sections and actions

export default function CRMAccountDetail() {
    const { accountId } = useParams(); // Get accountId from URL for fetching specific account details
    const navigate = useNavigate();

    const [accountData, setAccountData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = "https://localhost:7274/api/accounts"; // Define your API URL

    // Function to transform object keys from camelCase to PascalCase
    const transformKeysToPascalCase = (obj) => {
        const newObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                newObj[pascalKey] = obj[key];
            }
        }
        return newObj;
    };

    // Function to fetch account data
    useEffect(() => {
        setLoading(true);
        setError(null);

        const fetchAccount = async () => {
            try {
                console.log(`[CRMAccountDetail] Fetching account data from: ${API_URL}/${accountId}`);
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
                            console.error("[CRMAccountDetail] Failed to parse JSON error response:", jsonError);
                        }
                    } else {
                        errorDetails = await response.text();
                        console.error("[CRMAccountDetail] Non-JSON error response:", errorDetails);
                    }
                    throw new Error(errorDetails);
                }
                const rawData = await response.json();
                console.log("Fetched raw account data:", rawData);

                // Transform keys from camelCase (from backend) to PascalCase (for React state)
                const transformedData = transformKeysToPascalCase(rawData);
                setAccountData(transformedData);
                console.log("accountData state updated with (transformed):", transformedData);

            } catch (err) {
                console.error("Failed to load account data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (accountId) {
            fetchAccount();
        } else {
            setError("ไม่พบรหัสบัญชี");
            setLoading(false);
        }
    }, [accountId]); // Dependency on accountId

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

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <p className="text-danger mb-2">ข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
                <Button variant="primary" onClick={() => navigate('/crm-accounts')}>กลับไปยังรายการบัญชี</Button>
            </div>
        );
    }

    if (!accountData) {
        return (
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <p className="text-muted">ไม่พบข้อมูลบัญชี</p>
                <Button variant="primary" onClick={() => navigate('/crm-accounts')}>กลับไปยังรายการบัญชี</Button>
            </div>
        );
    }

    return (
        <div className="d-flex" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
            <CRMSidebar className="flex-shrink-0" style={{ position: 'fixed', height: '100vh', overflowY: 'auto' }} />

            <div className="flex-grow-1 d-flex flex-column" style={{ maxHeight: "100vh" }}>
                {/* Fixed Header with Title and Action Buttons */}
                <div className="flex-shrink-0 p-4 d-flex justify-content-between align-items-center" style={{ background: "#f3f7fb", zIndex: 1, position: 'sticky', top: 0 }}>
                    <h4 className="fw-bold mb-0" style={{ color: "#8a2be2" }}>
                        <ChevronLeft size={24} className="me-2 cursor-pointer" onClick={() => navigate(-1)} style={{ verticalAlign: 'middle' }} />
                        {accountData.AccountName}
                    </h4>
                    <div className="d-flex gap-2">
                        <Button
                            variant="outline-primary"
                            className="rounded-3 px-4 py-2"
                            onClick={() => navigate(`/crm-account-form/${accountId}`)}
                            style={{
                                borderColor: "#a1c4fd",
                                color: "#6a5acd",
                                transition: "all 0.3s ease",
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "scale(1.02)";
                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                            }}
                        >
                            <Edit size={16} className="me-2" />แก้ไข
                        </Button>
                        <Button
                            variant="outline-danger"
                            className="rounded-3 px-4 py-2"
                            onClick={() => console.log(`Delete account ${accountId}`)} // Implement actual delete confirmation modal
                            style={{
                                borderColor: "#ffb6c1",
                                color: "#f08080",
                                transition: "all 0.3s ease",
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "scale(1.02)";
                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                            }}
                        >
                            <Trash2 size={16} className="me-2" />ลบ
                        </Button>
                    </div>
                </div>

                {/* Scrollable Content Area (remaining sections) */}
                <div className="flex-grow-1 overflow-auto px-4 pb-4"> {/* Adjusted padding */}
                    <Row className="g-4">

                        {/* ผู้ติดต่อ (Contact Person) - Assuming it's part of the Account object for simplicity */}
                        <Col md={12}>
                            <Card className="shadow-lg rounded-4 border-0" style={{ backgroundColor: "#fdfdff" }}>
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                        <Building2 size={20} className="me-2 text-primary" />ข้อมูลบัญชี
                                    </h5>
                                    <Row>
                                        <div className="col-md-12">
                                            <p className="form-label mb-1 fw-bold">เจ้าของบัญชี:</p>
                                            <p>{accountData.Owner || '-'}</p>
                                        </div>
                                        <div className="col-md-12">
                                            <p className="form-label mb-1 fw-bold">อุตสาหกรรม:</p>
                                            <p>{accountData.Industry || '-'}</p>
                                        </div>
                                        <div className="col-md-12">
                                            <p className="form-label mb-1 fw-bold">พนักงาน:</p>
                                            <p>{accountData.Employees || '-'}</p>
                                        </div>
                                        <div className="col-md-12">
                                            <p className="form-label mb-1 fw-bold">รายได้ต่อปี:</p>
                                            <p>
                                                {accountData.AnnualRevenue !== null && accountData.AnnualRevenue !== undefined
                                                    ? parseFloat(accountData.AnnualRevenue).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div className="col-md-12">
                                            <p className="form-label mb-1 fw-bold">โทรศัพท์:</p>
                                            <p>{accountData.Phone || '-'}</p>
                                        </div>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* ผู้ติดต่อ (Contact Person) - Assuming it's part of the Account object for simplicity */}
                        <Col md={12}>
                            <Card className="shadow-lg rounded-4 border-0" style={{ backgroundColor: "#fdfdff" }}>
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                        <User size={20} className="me-2 text-success" />ผู้ติดต่อ
                                    </h5>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <p>{accountData.ContactPersonName || '-'}</p>
                                            <p className="text-muted mb-0 small">{accountData.ContactPersonEmail || '-'}</p>
                                            <p className="text-muted mb-0 small">{accountData.ContactPersonPhone || '-'}</p>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* ข้อมูลบัญชี (Account Information) */}
                        <Col md={12}>
                            <Card className="shadow-lg rounded-4 border-0" style={{ backgroundColor: "#fdfdff" }}>
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                        <Building2 size={20} className="me-2 text-primary" />ข้อมูลบัญชี
                                    </h5>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">เจ้าของบัญชี:</p>
                                                <p>{accountData.Owner || '-'}</p>
                                            </div>

                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">ชื่อบัญชี:</p>
                                                <p>{accountData.AccountName || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">เว็บไซต์บัญชี:</p>
                                                <p>{accountData.AccountWebsite || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">เว็บไซต์:</p>
                                                <p>{accountData.Website || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">บัญชีตัวหลัก:</p>
                                                <p>{accountData.PrimaryAccount || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">หมายเลขบัญชี:</p>
                                                <p>{accountData.AccountNumber || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">ประเภทบัญชี:</p>
                                                <p>{accountData.AccountType || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">อุตสาหกรรม:</p>
                                                <p>{accountData.Industry || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">รายได้ต่อปี:</p>
                                                <p>
                                                    {accountData.AnnualRevenue !== null && accountData.AnnualRevenue !== undefined
                                                        ? parseFloat(accountData.AnnualRevenue).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })
                                                        : '-'}
                                                </p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">การจัดอันดับ:</p>
                                                <p>{accountData.Rating || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">โทรศัพท์:</p>
                                                <p>{accountData.Phone || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">แฟกซ์:</p>
                                                <p>{accountData.Fax || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">สัญลักษณ์หุ้น:</p>
                                                <p>{accountData.TickerSymbol || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">พนักงาน:</p>
                                                <p>{accountData.Employees || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">โค้ด SIC:</p>
                                                <p>{accountData.SicCode || '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">สร้างเมื่อ:</p>
                                                <p>{accountData.CreatedAt ? new Date(accountData.CreatedAt).toLocaleString('th-TH') : '-'}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p className="form-label mb-1 fw-bold">แก้ไขล่าสุด:</p>
                                                <p>{accountData.UpdatedAt ? new Date(accountData.UpdatedAt).toLocaleString('th-TH') : '-'}</p>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>



                        {/* ข้อมูลที่อยู่ (Address Information) */}
                        <Col md={12}>
                            <Card className="shadow-lg rounded-4 border-0" style={{ backgroundColor: "#fdfdff" }}>
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                        <MapPin size={20} className="me-2 text-warning" />ข้อมูลที่อยู่
                                    </h5>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <h6 className="fw-bold mb-3 text-secondary">ที่อยู่สำหรับเรียกเก็บเงิน</h6>
                                            <div className="mb-2">
                                                <p className="form-label mb-1 fw-bold">ถนน:</p>
                                                <p>{accountData.BillingStreet || '-'}</p>
                                            </div>
                                            <div className="mb-2">
                                                <p className="form-label mb-1 fw-bold">อำเภอ:</p>
                                                <p>{accountData.BillingDistrict || '-'}</p>
                                            </div>
                                            <div className="mb-2">
                                                <p className="form-label mb-1 fw-bold">จังหวัด:</p>
                                                <p>{accountData.BillingProvince || '-'}</p>
                                            </div>
                                            <div className="mb-2">
                                                <p className="form-label mb-1 fw-bold">รหัสไปรษณีย์:</p>
                                                <p>{accountData.BillingZipCode || '-'}</p>
                                            </div>
                                            <div className="mb-2">
                                                <p className="form-label mb-1 fw-bold">ประเทศ:</p>
                                                <p>{accountData.BillingCountry || '-'}</p>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <h6 className="fw-bold mb-3 text-secondary">ที่อยู่สำหรับจัดส่ง</h6>
                                            <div className="mb-2">
                                                <p className="form-label mb-1 fw-bold">ถนนที่อยู่การจัดส่ง:</p>
                                                <p>{accountData.ShippingStreet || '-'}</p>
                                            </div>
                                            <div className="mb-2">
                                                <p className="form-label mb-1 fw-bold">อำเภอที่อยู่การจัดส่ง:</p>
                                                <p>{accountData.ShippingDistrict || '-'}</p>
                                            </div>
                                            <div className="mb-2">
                                                <p className="form-label mb-1 fw-bold">จังหวัดที่อยู่การจัดส่ง:</p>
                                                <p>{accountData.ShippingProvince || '-'}</p>
                                            </div>
                                            <div className="mb-2">
                                                <p className="form-label mb-1 fw-bold">รหัสไปรษณีย์ที่อยู่การจัดส่ง:</p>
                                                <p>{accountData.ShippingZipCode || '-'}</p>
                                            </div>
                                            <div className="mb-2">
                                                <p className="form-label mb-1 fw-bold">ประเทศที่อยู่การจัดส่ง:</p>
                                                <p>{accountData.ShippingCountry || '-'}</p>
                                            </div>

                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* ข้อมูลคำอธิบาย (Description Information) */}
                        <Col md={12}>
                            <Card className="shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                        <FileText size={20} className="me-2 text-info" />ข้อมูลคำอธิบาย
                                    </h5>
                                    <p className="form-label mb-1 fw-bold">คำอธิบาย:</p>
                                    <p>{accountData.Description || '-'}</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* TODO: Add sections for Contacts, Opportunities, Activities, Emails, etc. */}
                        {/* These sections would typically fetch related data based on accountId */}

                    </Row>
                </div>
            </div>
        </div>
    );
}
