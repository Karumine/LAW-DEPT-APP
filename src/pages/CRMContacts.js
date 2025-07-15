import React, { useState, useEffect, useCallback } from 'react';
import CRMSidebar from '../components/CRMSidebar';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function CRMContacts() { // เปลี่ยนชื่อ Component กลับเป็น CRMContacts
    const [contacts, setContacts] = useState([]); // เปลี่ยนชื่อ state จาก accounts เป็น contacts
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation modal
    const [contactToDelete, setContactToDelete] = useState(null); // State to store contact ID to delete
    const navigate = useNavigate();

    // กำหนด URL ของ API สำหรับผู้ติดต่อ (ต้องตรงกับที่คุณตั้งค่าใน C#.NET Backend)
    const API_URL = "https://localhost:7274/api/contacts"; // เปลี่ยน API URL กลับไปที่ /api/contacts

    // ฟังก์ชันสำหรับดึงข้อมูลผู้ติดต่อจาก API
    const fetchContacts = useCallback(async () => { // เปลี่ยนชื่อฟังก์ชันกลับ
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                let errorDetails = `Failed to fetch contacts: ${response.status}`; // เปลี่ยนข้อความ
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[CRMContacts] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[CRMContacts] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }

            const data = await response.json();
            setContacts(data); // อัปเดต state ด้วยข้อมูลผู้ติดต่อที่ได้มา
            console.log("[CRMContacts] Fetched contacts:", data);
        } catch (err) {
            console.error("Failed to fetch contacts:", err); // เปลี่ยนข้อความ
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [API_URL]); // Add API_URL to dependencies

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // ฟังก์ชันสำหรับการนำทางไปยังหน้าเพิ่มผู้ติดต่อใหม่
    const handleAddContact = () => { // เปลี่ยนชื่อฟังก์ชัน
        navigate("/crm-contacts-form"); // เปลี่ยนเส้นทางให้ตรงกับ Route ของผู้ติดต่อ
    };

    // ฟังก์ชันสำหรับการนำทางไปยังหน้าแก้ไขผู้ติดต่อ
    const handleEditContact = (id) => { // เปลี่ยนชื่อฟังก์ชัน
        console.log(`[CRMContacts] Navigating to edit contact with ID: ${id}`);
        navigate(`/crm-contact-form/${id}`); // เปลี่ยนเส้นทางให้ตรงกับ Route ของผู้ติดต่อ
    };

    // ฟังก์ชันสำหรับเตรียมการลบ (แสดง Modal)
    const confirmDeleteContact = (id) => {
        setContactToDelete(id);
        setShowDeleteConfirm(true);
        // NOTE: In a real application, you would show a custom modal here
        // For now, we'll log to console and simulate deletion.
        console.log(`[CRMContacts] User wants to delete contact ID: ${id}. A custom modal should appear here.`);
    };

    // ฟังก์ชันสำหรับลบผู้ติดต่อจริง (เมื่อยืนยันจาก Modal)
    const handleDeleteContact = async () => { // เปลี่ยนชื่อฟังก์ชัน
        if (!contactToDelete) return; // Ensure there's an ID to delete

        setShowDeleteConfirm(false); // Close the confirmation modal
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/${contactToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                let errorDetails = `Failed to delete contact: ${response.status}`; // เปลี่ยนข้อความ
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[handleDeleteContact] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[handleDeleteContact] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }

            setContacts(prevContacts => prevContacts.filter(contact => contact.id !== contactToDelete)); // กรองผู้ติดต่อที่ถูกลบ
            setContactToDelete(null); // Clear the ID after deletion
            console.log('ผู้ติดต่อถูกลบเรียบร้อยแล้ว!'); // เปลี่ยนข้อความ
            // In a real app, you might show a success toast/message here
        } catch (err) {
            console.error("Failed to delete contact:", err); // เปลี่ยนข้อความ
            setError(`เกิดข้อผิดพลาดในการลบผู้ติดต่อ: ${err.message}`); // เปลี่ยนข้อความ
            // In a real app, you might show an error toast/message here
        } finally {
            setLoading(false);
        }
    };

    const handleViewContactDetail = (id) => {
        console.log(`[CRMContacts] Navigating to contact detail with ID: ${id}`);
        navigate(`/crm-contact-detail/${id}`); // Navigate to the detail page
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-2">กำลังโหลดผู้ติดต่อ...</p> {/* เปลี่ยนข้อความ */}
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <p className="text-danger mb-2">ข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
                <button className="btn btn-primary" onClick={fetchContacts}>ลองใหม่</button>
            </div>
        );
    }

    return (
        <div className="d-flex" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
            <CRMSidebar className="flex-shrink-0" />

            <div className="flex-grow-1 d-flex flex-column" style={{ maxHeight: "100vh" }}>
                {/* ส่วนหัว Fixed: ชื่อหน้า, ปุ่มค้นหา, ปุ่มเพิ่มใหม่ */}
                <div className="container-fluid py-4 px-4 flex-shrink-0" style={{ background: "#f3f7fb", zIndex: 1 }}>
                    <h4 className="fw-bold mb-4" style={{ color: "#8a2be2" }}>📞 ผู้ติดต่อ</h4> {/* เปลี่ยนชื่อหน้าและไอคอน */}

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        {/* ช่องค้นหา */}
                        <div className="input-group" style={{ maxWidth: "500px" }}>
                            <input
                                type="text"
                                className="form-control rounded-start-3"
                                placeholder="ค้นหาผู้ติดต่อ..." // เปลี่ยนข้อความ
                                style={{ borderColor: "#c2e9fb" }}
                            />
                            <button
                                className="btn btn-outline-secondary rounded-end-3"
                                type="button"
                                style={{ borderColor: "#c2e9fb", color: "#6a5acd" }}
                            >
                                🔍
                            </button>
                        </div>

                        {/* ปุ่มเพิ่มผู้ติดต่อใหม่ */}
                        <button
                            className="btn btn-lg px-4 py-2 rounded-3 shadow-sm btn-hover-scale"
                            style={{
                                background: "linear-gradient(45deg, #add8e6, #87ceeb)",
                                borderColor: "#add8e6",
                                color: "#36454F",
                                transition: "all 0.3s ease",
                            }}
                            onClick={handleAddContact} // เปลี่ยนชื่อฟังก์ชัน
                        >
                            ➕ เพิ่มผู้ติดต่อใหม่
                        </button>
                    </div>
                </div>

                {/* พื้นที่เนื้อหาที่เลื่อนได้: ตารางแสดงผู้ติดต่อ */}
                <div
                    className="card p-4 shadow-lg rounded-4 border-0 fade-in flex-grow-1 overflow-auto mx-4 mb-4"
                    style={{ backgroundColor: "#fdfdff" }}
                >
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr style={{ background: "#e0eaff" }}>
                                    <th scope="col" className="text-center" style={{ color: "#6a5acd" }}>
                                        <input type="checkbox" />
                                    </th>
                                    <th scope="col" style={{ color: "#6a5acd" }}>ชื่อผู้ติดต่อ</th> {/* เปลี่ยนหัวข้อคอลัมน์ */}
                                    <th scope="col" style={{ color: "#6a5acd" }}>ชื่อบัญชี</th>
                                    <th scope="col" style={{ color: "#6a5acd" }}>อีเมล</th>
                                    <th scope="col" style={{ color: "#6a5acd" }}>โทรศัพท์</th>
                                    <th scope="col" style={{ color: "#6a5acd" }}>เจ้าของ</th>
                                    <th scope="col" className="text-center" style={{ color: "#6a5acd" }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.length > 0 ? (
                                    contacts.map((contact) => ( // เปลี่ยนชื่อตัวแปรกลับ
                                        <tr
                                            key={contact.id}
                                            className="table-row-hover-effect"
                                            style={{ transition: "all 0.3s ease" }}
                                        >
                                            <td className="text-center">
                                                <input type="checkbox" />
                                            </td>
                                            {/* แสดง accountName */}
                                            <td>
                                                <span
                                                    onClick={() => handleViewContactDetail(contact.id)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        color: '#6a5acd', // A nice blue/purple for links
                                                        fontWeight: 'bold', // Make it stand out as a link
                                                        //textDecoration: 'underline', // Underline to indicate clickability
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = '#8a2be2'} // Darker on hover
                                                    onMouseOut={(e) => e.currentTarget.style.color = '#6a5acd'} // Back to original color
                                                >
                                                    {`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '-'}
                                                </span>
                                            </td>
                                            <td>{contact.accountName || '-'}</td>
                                            <td>{contact.email || '-'}</td>
                                            <td>{contact.phone || '-'}</td>
                                            <td>{contact.owner || '-'}</td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2 rounded-2 btn-icon-hover"
                                                    style={{ borderColor: "#b0c4de", color: "#6a5acd" }}
                                                    onClick={() => handleEditContact(contact.id)} // เปลี่ยนชื่อฟังก์ชัน
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-2 btn-icon-hover"
                                                    style={{ borderColor: "#ffb6c1", color: "#f08080" }}
                                                    onClick={() => confirmDeleteContact(contact.id)} // เรียกฟังก์ชัน confirmDeleteContact
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">ไม่พบผู้ติดต่อ</td> {/* เปลี่ยนข้อความและ colSpan */}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Placeholder for Custom Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
            )}
            {showDeleteConfirm && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content rounded-3 shadow-lg">
                            <div className="modal-header bg-warning text-white border-bottom-0">
                                <h5 className="modal-title">ยืนยันการลบผู้ติดต่อ</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowDeleteConfirm(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p>คุณแน่ใจหรือไม่ว่าต้องการลบผู้ติดต่อ ID: <strong>{contactToDelete}</strong> นี้?</p>
                                <p className="text-danger small">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                            </div>
                            <div className="modal-footer border-top-0 d-flex justify-content-end">
                                <button type="button" className="btn btn-secondary rounded-3 px-3" onClick={() => setShowDeleteConfirm(false)}>ยกเลิก</button>
                                <button type="button" className="btn btn-danger rounded-3 px-3" onClick={handleDeleteContact}>ลบ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
