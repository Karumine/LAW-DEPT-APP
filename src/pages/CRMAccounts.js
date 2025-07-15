import React, { useState, useEffect, useCallback } from 'react';
import CRMSidebar from '../components/CRMSidebar';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function CRMAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation modal
    const [accountToDelete, setAccountToDelete] = useState(null); // State to store account ID to delete
    const navigate = useNavigate();

    const API_URL = "https://localhost:7274/api/accounts";

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                let errorDetails = `Failed to fetch accounts: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[CRMAccounts] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[CRMAccounts] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }

            const data = await response.json();
            setAccounts(data);
            console.log("[CRMAccounts] Fetched accounts:", data);
        } catch (err) {
            console.error("Failed to fetch accounts:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleAddAccount = () => {
        navigate("/crm-accounts-form");
    };

    const handleEditAccount = (id) => {
        console.log(`[CRMAccounts] Navigating to edit account with ID: ${id}`);
        navigate(`/crm-account-form/${id}`);
    };

    // Function to navigate to account detail page
    const handleViewAccountDetail = (id) => {
        console.log(`[CRMAccounts] Navigating to account detail with ID: ${id}`);
        navigate(`/crm-accounts-detail/${id}`); // Navigate to the new detail page
    };

    // Function to prepare for delete (show modal)
    const confirmDeleteAccount = (id) => {
        setAccountToDelete(id);
        setShowDeleteConfirm(true);
        console.log(`[CRMAccounts] User wants to delete account ID: ${id}. A custom modal should appear here.`);
    };

    // Function to actually delete the account (after confirmation from modal)
    const handleDeleteAccount = async () => {
        if (!accountToDelete) return;

        setShowDeleteConfirm(false); // Close the confirmation modal
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/${accountToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                let errorDetails = `Failed to delete account: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[handleDeleteAccount] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[handleDeleteAccount] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }

            setAccounts(prevAccounts => prevAccounts.filter(account => account.id !== accountToDelete));
            setAccountToDelete(null); // Clear the ID after deletion
            console.log('บัญชีถูกลบเรียบร้อยแล้ว!');
            // In a real app, you might show a success toast/message here
        } catch (err) {
            console.error("Failed to delete account:", err);
            setError(`เกิดข้อผิดพลาดในการลบบัญชี: ${err.message}`);
            // In a real app, you might show an error toast/message here
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-2">กำลังโหลดบัญชี...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <p className="text-danger mb-2">ข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
                <button className="btn btn-primary" onClick={fetchAccounts}>ลองใหม่</button>
            </div>
        );
    }

    return (
        <div className="d-flex" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
            <CRMSidebar className="flex-shrink-0" />

            <div className="flex-grow-1 d-flex flex-column" style={{ maxHeight: "100vh" }}>
                <div className="container-fluid py-4 px-4 flex-shrink-0" style={{ background: "#f3f7fb", zIndex: 1 }}>
                    <h4 className="fw-bold mb-4" style={{ color: "#8a2be2" }}>🏢 บัญชี</h4>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="input-group" style={{ maxWidth: "500px" }}>
                            <input
                                type="text"
                                className="form-control rounded-start-3"
                                placeholder="ค้นหาบัญชี..."
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

                        <button
                            className="btn btn-lg px-4 py-2 rounded-3 shadow-sm btn-hover-scale"
                            style={{
                                background: "linear-gradient(45deg, #add8e6, #87ceeb)",
                                borderColor: "#add8e6",
                                color: "#36454F",
                                transition: "all 0.3s ease",
                            }}
                            onClick={handleAddAccount}
                        >
                            ➕ เพิ่มบัญชีใหม่
                        </button>
                    </div>
                </div>

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
                                    <th scope="col" style={{ color: "#6a5acd" }}>ชื่อบัญชี</th>
                                    <th scope="col" style={{ color: "#6a5acd" }}>โทรศัพท์</th>
                                    <th scope="col" style={{ color: "#6a5acd" }}>เว็บไซต์</th>
                                    <th scope="col" style={{ color: "#6a5acd" }}>เจ้าของบัญชี</th>
                                    <th scope="col" className="text-center" style={{ color: "#6a5acd" }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.length > 0 ? (
                                    accounts.map((account) => (
                                        <tr
                                            key={account.id}
                                            className="table-row-hover-effect"
                                            style={{ transition: "all 0.3s ease" }}
                                        >
                                            <td className="text-center">
                                                <input type="checkbox" />
                                            </td>
                                            {/* Make accountName clickable */}
                                            <td
                                                onClick={() => handleViewAccountDetail(account.id)}
                                                style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                                            >
                                                {account.accountName || '-'}
                                            </td>
                                            <td>{account.phone || '-'}</td>
                                            <td>{account.website || '-'}</td>
                                            <td>{account.owner || '-'}</td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2 rounded-2 btn-icon-hover"
                                                    style={{ borderColor: "#b0c2e9", color: "#6a5acd" }}
                                                    onClick={() => handleEditAccount(account.id)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-2 btn-icon-hover"
                                                    style={{ borderColor: "#ffb6c1", color: "#f08080" }}
                                                    onClick={() => confirmDeleteAccount(account.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-4">ไม่พบบัญชี</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
            )}
            {showDeleteConfirm && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content rounded-3 shadow-lg">
                            <div className="modal-header bg-warning text-white border-bottom-0">
                                <h5 className="modal-title">ยืนยันการลบบัญชี</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowDeleteConfirm(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p>คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี ID: <strong>{accountToDelete}</strong> นี้?</p>
                                <p className="text-danger small">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                            </div>
                            <div className="modal-footer border-top-0 d-flex justify-content-end">
                                <button type="button" className="btn btn-secondary rounded-3 px-3" onClick={() => setShowDeleteConfirm(false)}>ยกเลิก</button>
                                <button type="button" className="btn btn-danger rounded-3 px-3" onClick={handleDeleteAccount}>ลบ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
