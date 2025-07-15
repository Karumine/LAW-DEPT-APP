import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CRMSidebar from "../components/CRMSidebar";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import CreateTaskModal from './CreateTaskModal'; // Import the new modal component
import { Calendar, Clipboard, User, Bell, Repeat, Clock, Info, Paperclip, CheckSquare, Edit, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react'; // Import new Lucide Icons
import { Modal, Button } from 'react-bootstrap';

export default function CRMProspectDetail() {
    const { leadID } = useParams();
    const navigate = useNavigate();

    const [prospect, setProspect] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [showFullDetails, setShowFullDetails] = useState(true);

    // State for Tasks related to this lead
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [tasksError, setTasksError] = useState(null);

    // State for the Create Task Modal
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

    // State for Delete Confirmation Modal
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null); // To store the task ID to be deleted

    // State for Close Task Confirmation Modal
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [taskToClose, setTaskToClose] = useState(null); // To store the task ID to be closed

    // States for notes management in CRMProspectDetail
    const [newNote, setNewNote] = useState("");
    const [allLeadNotes, setAllLeadNotes] = useState([]); // To store all parsed notes from all tasks
    const [noteSaveMessage, setNoteSaveMessage] = useState(null);
    const [noteSaveMessageType, setNoteSaveMessageType] = useState(null); // 'success' or 'error'

    const API_URL = "https://localhost:7274/api/leads";
    const TASKS_API_URL = "https://localhost:7274/api/tasks"; // API for tasks

    // Mapping of internal status values to display labels (Thai) - Added to CRMProspectDetail
    const statusLabels = {
        Open: "เปิด",
        NotStarted: "ไม่ได้เริ่ม",
        Postponed: "เลื่อนเวลา",
        InProgress: "กำลังคืบหน้า",
        Completed: "เสร็จสมบูรณ์",
        WaitingInput: "รอข้อมูลอินพุต",
        Closed: "ปิดแล้ว" // Keep "Closed" for the actual value from backend if it exists
    };

    // Function to fetch prospect details
    const fetchProspectDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("Fetching prospect detail for ID:", leadID);
            const response = await fetch(`${API_URL}/${leadID}`);

            if (!response.ok) {
                let errorDetails = `Failed to fetch prospect detail: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[fetchProspectDetail] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[fetchProspectDetail] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }
            const data = await response.json();
            console.log("Fetched prospect data:", data);
            setProspect(data);
        } catch (err) {
            console.error("Failed to fetch prospect detail:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [leadID]);

    // Function to fetch tasks for the current lead and extract notes
    const fetchTasksForLead = useCallback(async () => {
        if (!leadID) {
            setTasksError("Lead ID is missing, cannot fetch tasks.");
            return;
        }
        setLoadingTasks(true);
        setTasksError(null);
        console.log(`[fetchTasksForLead] Attempting to fetch tasks for leadId: ${leadID}`);
        try {
            const cacheBuster = new Date().getTime();
            const response = await fetch(`${TASKS_API_URL}?leadId=${leadID}&_=${cacheBuster}`);
            if (!response.ok) {
                let errorDetails = `Failed to fetch tasks: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[fetchTasksForLead] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[fetchTasksForLead] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }
            const data = await response.json();
            console.log(`[fetchTasksForLead] Successfully fetched tasks for lead ${leadID}:`, data);
            setTasks(data);

            // Extract and parse notes from all fetched tasks
            const tempAllNotes = [];
            data.forEach(task => {
                if (task.notesContent && typeof task.notesContent === 'string') {
                    const parsedNotes = task.notesContent.split('\n').filter(line => line.trim() !== '').map((line, index) => {
                        const sourceMatch = line.match(/^\[(.*?)\]\s*(.*)\s+\((.*)\)$/);
                        if (sourceMatch && sourceMatch.length === 4) {
                            return {
                                id: `note-${task.id}-${index}-${Date.now()}`, // Unique ID for each note
                                taskId: task.id, // Store the task ID this note belongs to
                                source: sourceMatch[1].trim(),
                                text: sourceMatch[2].trim(),
                                timestamp: sourceMatch[3].trim()
                            };
                        }
                        const simpleMatch = line.match(/(.*)\s+\((.*)\)$/);
                        if (simpleMatch && simpleMatch.length === 3) {
                            return {
                                id: `note-${task.id}-${index}-${Date.now()}`,
                                taskId: task.id,
                                source: 'ไม่ระบุที่มา',
                                text: simpleMatch[1].trim(),
                                timestamp: simpleMatch[2].trim()
                            };
                        }
                        return {
                            id: `note-${task.id}-${index}-${Date.now()}`,
                            taskId: task.id,
                            source: 'ไม่ระบุที่มา',
                            text: line.trim(),
                            timestamp: new Date().toLocaleString('th-TH')
                        };
                    });
                    tempAllNotes.push(...parsedNotes);
                }
            });

            // Sort notes by timestamp (most recent first)
            tempAllNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setAllLeadNotes(tempAllNotes);

        } catch (err) {
            console.error(`[fetchTasksForLead] Error fetching tasks for lead ${leadID}:`, err);
            setTasksError(err.message);
        } finally {
            setLoadingTasks(false);
        }
    }, [leadID]);

    // Initial fetch for prospect details
    useEffect(() => {
        if (leadID) {
            fetchProspectDetail();
        } else {
            setLoading(false);
            setError("ไม่พบ Lead ID ที่ส่งมา");
            console.error("CRMProspectDetail: leadID is undefined or null.");
        }
    }, [leadID, fetchProspectDetail]);

    // Fetch tasks when leadID changes or when the modal is closed (after task creation)
    useEffect(() => {
        if (leadID) {
            fetchTasksForLead();
        }
    }, [leadID, fetchTasksForLead]);

    const handleGoBack = () => {
        window.history.back();
    };

    // Functions to open and close the Create Task Modal
    const handleShowCreateTaskModal = () => setShowCreateTaskModal(true);
    const handleCloseCreateTaskModal = () => {
        console.log('[handleCloseCreateTaskModal] Modal is closing, triggering task refresh.');
        setShowCreateTaskModal(false);
        fetchTasksForLead(); // Refresh tasks after modal is closed (assuming a task might have been created)
    };

    // Functions to handle Delete Task
    const confirmDeleteTask = (taskId) => {
        setTaskToDelete(taskId);
        setShowDeleteConfirmModal(true);
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) return;

        setShowDeleteConfirmModal(false);
        setLoadingTasks(true);
        setTasksError(null);

        try {
            console.log(`[handleDeleteTask] Attempting to delete task ID: ${taskToDelete}`);
            const response = await fetch(`${TASKS_API_URL}/${taskToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                let errorDetails = `Failed to delete task: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[handleDelete] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[handleDelete] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }

            console.log(`[handleDeleteTask] Successfully deleted task ID: ${taskToDelete}`);
            setTaskToDelete(null);
            fetchTasksForLead(); // Refresh the list of tasks and notes
        } catch (err) {
            console.error(`[handleDeleteTask] Error deleting task ID ${taskToDelete}:`, err);
            setTasksError(`Failed to delete task: ${err.message}`);
        } finally {
            setLoadingTasks(false);
        }
    };

    // Functions to handle Close Task
    const confirmCloseTask = (taskId) => {
        setTaskToClose(taskId);
        setShowCloseConfirmModal(true);
    };

    const handleCloseTask = async () => {
        if (!taskToClose) return;

        setShowCloseConfirmModal(false);
        setLoadingTasks(true);
        setTasksError(null);

        try {
            const currentTask = tasks.find(task => task.id === taskToClose);
            if (!currentTask) {
                throw new Error("Task not found in current list.");
            }

            const updatedTaskData = {
                ...currentTask,
                Status: "Completed",
                ClosedAt: new Date().toISOString(),
            };

            console.log(`[handleCloseTask] Attempting to close task ID: ${taskToClose} with data:`, updatedTaskData);

            const response = await fetch(`${TASKS_API_URL}/${taskToClose}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTaskData),
            });

            if (!response.ok) {
                let errorDetails = `Failed to close task: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[handleCloseTask] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[handleCloseTask] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }

            console.log(`[handleCloseTask] Successfully closed task ID: ${taskToClose}`);
            setTaskToClose(null);
            fetchTasksForLead(); // Refresh the list of tasks and notes
        } catch (err) {
            console.error(`[handleCloseTask] Error closing task ID ${taskToClose}:`, err);
            setTasksError(`Failed to close task: ${err.message}`);
        } finally {
            setLoadingTasks(false);
        }
    };

    // Function to handle adding a new note by creating a new task
    const handleAddNote = async () => {
        setNoteSaveMessage(null); // Clear previous messages
        setNoteSaveMessageType(null);

        if (!newNote.trim() || !prospect || !prospect.id) {
            console.warn("[handleAddNote] Cannot add empty note or prospect/prospectId is missing.", { newNote, prospect });
            setNoteSaveMessage("ไม่สามารถเพิ่มบันทึกย่อว่างเปล่าได้ หรือข้อมูลลูกค้ามุ่งหวังไม่สมบูรณ์.");
            setNoteSaveMessageType('error');
            return;
        }

        const noteText = newNote.trim();
        const currentTimestamp = new Date().toLocaleString('th-TH');
        const sourceInfo = `ลูกค้ามุ่งหวัง - ${prospect.firstName || ''} ${prospect.lastName || ''}`;

        const fullNoteEntry = `[${sourceInfo}] ${noteText} (${currentTimestamp})`;

        // Prepare new task data for API call (to create a task specifically for this note)
        const newTaskData = {
            Subject: `บันทึกย่อสำหรับลูกค้ามุ่งหวัง: ${prospect.firstName || ''} ${prospect.lastName || ''}`,
            DueDate: null, // No specific due date for a general note task
            Priority: 'ต่ำ', // Default low priority for a general note
            Owner: 'Supap Nonkaew', // Default owner
            Reminder: false,
            ReminderTime: null,
            ReminderMethod: null,
            Repeat: 'None',
            LeadId: parseInt(leadID),
            Status: 'Open', // A note task is 'Open' by default
            Description: 'บันทึกย่อทั่วไปที่เพิ่มจากหน้ารายละเอียดลูกค้ามุ่งหวัง',
            Attachments: null, // Attachments are separate
            NotesContent: fullNoteEntry, // Store the new note here
            ClosedAt: null,
        };

        setLoading(true); // Indicate loading for the API call (general page loading)
        setError(null); // Clear general page error

        try {
            console.log(`[handleAddNote] Attempting to create new task for note for lead ID: ${leadID}.`, newTaskData);
            const response = await fetch(TASKS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTaskData),
            });

            if (!response.ok) {
                let errorDetails = `Failed to add note (create task): ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[handleAddNote] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[handleAddNote] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }

            console.log(`[handleAddNote] Successfully added note (created new task) for lead ID: ${leadID}.`);
            setNoteSaveMessage("บันทึกย่อถูกเพิ่มเรียบร้อยแล้ว!");
            setNoteSaveMessageType('success');
            setNewNote(""); // Clear the input field
            fetchTasksForLead(); // Refresh the list of tasks and notes

        } catch (err) {
            console.error(`[handleAddNote] Error adding note (creating task) for lead ID ${leadID}:`, err);
            setNoteSaveMessage(`ไม่สามารถเพิ่มบันทึกย่อได้: ${err.message}`);
            setNoteSaveMessageType('error');
            setError(`Failed to add note: ${err.message}`); // Also set general page error
        } finally {
            setLoading(false);
            // Clear note-specific message after a few seconds
            setTimeout(() => {
                setNoteSaveMessage(null);
                setNoteSaveMessageType(null);
            }, 3000);
        }
    };


    // Function to generate Google Calendar URL
    const generateGoogleCalendarUrl = (task) => {
        const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
        const subject = encodeURIComponent(task.subject || '');
        const description = encodeURIComponent(task.description || '');

        let dates = '';
        if (task.dueDate) {
            const startDate = new Date(task.dueDate);
            let endDate = new Date(task.dueDate);

            if (task.reminderTime) {
                const [hours, minutes] = task.reminderTime.split(':');
                startDate.setHours(parseInt(hours, 10));
                startDate.setMinutes(parseInt(minutes, 10));
                endDate.setHours(parseInt(hours, 10) + 1);
                endDate.setMinutes(parseInt(minutes, 10));
            } else {
                endDate.setDate(endDate.getDate() + 1);
            }

            const formatDateTime = (date) => {
                if (isNaN(date.getTime())) {
                    console.error("Invalid Date object for Google Calendar URL:", date);
                    return '';
                }
                if (task.reminderTime) {
                    return date.toISOString().replace(/[-:]|\.\d{3}/g, '');
                } else {
                    return date.toISOString().split('T')[0].replace(/-/g, '');
                }
            };

            dates = `${formatDateTime(startDate)}/${formatDateTime(endDate)}`;
        }

        return `${baseUrl}&text=${subject}&details=${description}&dates=${dates}`;
    };


    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (e) {
            console.error("Invalid date string:", dateString, e);
            return '-';
        }
    };

    const formatTimeSpan = (timeSpanString) => {
        if (!timeSpanString) return '-';
        try {
            const [hours, minutes] = timeSpanString.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) {
            console.error("Invalid time span string:", timeSpanString, e);
            return '-';
        }
    };

    const formatClosedAt = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        } catch (e) {
            console.error("Invalid ClosedAt date string:", dateString, e);
            return '-';
        }
    };

    const handleViewTaskDetail = (taskId) => {
        navigate(`/crm-appointment-detail/${taskId}`);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-2">กำลังโหลดรายละเอียดลูกค้ามุ่งหวัง...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <p className="text-danger mb-2">ข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
                <button className="btn btn-primary" onClick={() => navigate('/crm-prospects')}>กลับไปรายการ</button>
            </div>
        );
    }

    if (!prospect) {
        return (
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <p className="text-muted">ไม่พบข้อมูลลูกค้ามุ่งหวัง</p>
                <button className="btn btn-primary" onClick={() => navigate('/crm-prospects')}>กลับไปรายการ</button>
            </div>
        );
    }

    // Filter tasks into open and closed based on status
    const openTasks = tasks.filter(task => task.status !== 'Completed');
    const closedTasks = tasks.filter(task => task.status === 'Completed');

    return (
        <div className="d-flex" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
            <CRMSidebar className="flex-shrink-0" />

            <div className="flex-grow-1 d-flex flex-column" style={{ maxHeight: "100vh" }}>
                {/* ส่วนหัว Fixed: ชื่อผู้ใช้, ปุ่มต่างๆ, บันทึกล่าสุด */}
                <div className="container-fluid py-3 px-4 flex-shrink-0" style={{ background: "#f3f7fb", zIndex: 1, borderBottom: "1px solid #e0eaff" }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="fw-bold" style={{ color: "#8a2be2" }}>
                            👤 {prospect.prefix} {prospect.firstName} {prospect.lastName}
                        </h4>
                        <div className="d-flex align-items-center gap-2">
                            <button className="btn btn-sm btn-outline-secondary rounded-3" style={{ borderColor: "#c2e9fb", color: "#6a5acd" }}>ส่งอีเมล</button>
                            <button className="btn btn-sm btn-outline-secondary rounded-3" style={{ borderColor: "#c2e9fb", color: "#6a5acd" }}>แปลง</button>
                        </div>
                    </div>
                </div>

                {/* แถบนำทาง Tab (ภาพรวม, ไทม์ไลน์) - Fixed */}
                <div className="container-fluid px-4 py-2 flex-shrink-0" style={{ background: "#f3f7fb", borderBottom: "1px solid #e0eaff" }}>
                    <ul className="nav nav-tabs border-0">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                                onClick={() => setActiveTab("overview")}
                                style={{
                                    color: activeTab === "overview" ? "#6a5acd" : "#6c757d",
                                    backgroundColor: activeTab === "overview" ? "#fdfdff" : "transparent",
                                    border: activeTab === "overview" ? "1px solid #e0eaff" : "none",
                                    borderBottom: activeTab === "overview" ? "none" : "1px solid #e0eaff",
                                    fontWeight: activeTab === "overview" ? "bold" : "normal",
                                    borderRadius: "8px 8px 0 0",
                                    padding: "10px 20px"
                                }}
                            >
                                ภาพรวม
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "timeline" ? "active" : ""}`}
                                onClick={() => setActiveTab("timeline")}
                                style={{
                                    color: activeTab === "timeline" ? "#6a5acd" : "#6c757d",
                                    backgroundColor: activeTab === "timeline" ? "#fdfdff" : "transparent",
                                    border: activeTab === "timeline" ? "1px solid #e0eaff" : "none",
                                    borderBottom: activeTab === "timeline" ? "none" : "1px solid #e0eaff",
                                    fontWeight: activeTab === "timeline" ? "bold" : "normal",
                                    borderRadius: "8px 8px 0 0",
                                    padding: "10px 20px"
                                }}
                            >
                                ไทม์ไลน์
                            </button>
                        </li>
                    </ul>
                </div>

                {/* พื้นที่เนื้อหาที่เลื่อนได้ */}
                <div className="flex-grow-1 overflow-auto px-4 py-3" style={{ paddingBottom: '2rem' }}>
                    {activeTab === "overview" && (
                        <div className="row justify-content-center">
                            <div className="col-md-12">
                                {/* === กรอบแรก: ข้อมูลสรุป (Summary Card) === */}
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>ข้อมูลสรุป</h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">เจ้าของลูกค้ามุ่งหวัง:</p>
                                            <p>{prospect.owner || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">บริษัท:</p>
                                            <p>{prospect.companyName || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">อีเมล:</p>
                                            <p>{prospect.email || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">โทรศัพท์:</p>
                                            <p>{prospect.phone || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">โทรศัพท์มือถือ:</p>
                                            <p>{prospect.mobile || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">สถานะลูกค้ามุ่งหวัง:</p>
                                            <p>{prospect.leadStatus || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* === ปุ่มสำหรับซ่อน/แสดงกรอบรายละเอียด === */}
                                <div className="d-flex justify-content-end mb-3">
                                    <button
                                        className="btn btn-outline-secondary btn-sm rounded-3"
                                        onClick={() => setShowFullDetails(!showFullDetails)}
                                    >
                                        {showFullDetails ? "ซ่อนรายละเอียดเพิ่มเติม" : "แสดงรายละเอียดเพิ่มเติม"}
                                        <i className={`ms-2 fas ${showFullDetails ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                    </button>
                                </div>

                                {/* === กรอบที่สอง: ข้อมูลรายละเอียดเต็ม (ใช้ CSS Transition แทน CSSTransition) === */}
                                <div
                                    className={`card p-4 shadow-lg rounded-4 border-0 mb-4 ${showFullDetails ? 'collapse-content' : 'collapse-content-collapsed'}`}
                                    style={{ backgroundColor: "#fdfdff" }}
                                >
                                    {/* Section: ข้อมูลลูกค้ามุ่งหวัง (Lead Information) */}
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>ข้อมูลลูกค้ามุ่งหวัง</h5>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">เจ้าของลูกค้ามุ่งหวัง:</p>
                                            <p>{prospect.owner || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">บริษัท:</p>
                                            <p>{prospect.companyName || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">ชื่อเต็ม:</p>
                                            <p>{`${prospect.prefix || ''} ${prospect.firstName || ''} ${prospect.lastName || ''}`.trim()}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">อีเมล:</p>
                                            <p>{prospect.email || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">ตำแหน่งงาน:</p>
                                            <p>{prospect.jobTitle || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">แฟกซ์:</p>
                                            <p>{prospect.fax || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">โทรศัพท์:</p>
                                            <p>{prospect.phone || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">เว็บไซต์:</p>
                                            <p>{prospect.website || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">โทรศัพท์มือถือ:</p>
                                            <p>{prospect.mobile || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">สถานะลูกค้ามุ่งหวัง:</p>
                                            <p>{prospect.leadStatus || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">แหล่งที่มาลูกค้ามุ่งหวัง:</p>
                                            <p>{prospect.leadSource || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">จำนวนพนักงาน:</p>
                                            <p>{prospect.numberOfEmployees || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">อุตสาหกรรม:</p>
                                            <p>{prospect.industry || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">การจัดอันดับ:</p>
                                            <p>{prospect.rating || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">รายได้ต่อปี:</p>
                                            <p>{prospect.annualRevenue || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">ไลน์ Skype:</p>
                                            <p>{prospect.skypeID || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">เลือกไม่ให้ติดต่อ:</p>
                                            <p>{prospect.doNotContact ? 'ใช่' : 'ไม่'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">อีเมลสำรอง:</p>
                                            <p>{prospect.secondaryEmail || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">Twitter:</p>
                                            <p>{prospect.twitter || '-'}</p>
                                        </div>
                                    </div>

                                    {/* Section: ข้อมูลที่อยู่ */}
                                    <h5 className="fw-bold mb-3 mt-4" style={{ color: "#6a5acd" }}>ข้อมูลที่อยู่</h5>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">ถนน:</p>
                                            <p>{prospect.street || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">เมือง:</p>
                                            <p>{prospect.city || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">รัฐ/จังหวัด:</p>
                                            <p>{prospect.state || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">รหัสไปรษณีย์:</p>
                                            <p>{prospect.zipCode || '-'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="form-label mb-1 fw-bold">ประเทศ:</p>
                                            <p>{prospect.country || '-'}</p>
                                        </div>
                                    </div>

                                    {/* Section: ข้อมูลคำอธิบาย */}
                                    <h5 className="fw-bold mb-3 mt-4" style={{ color: "#6a5acd" }}>ข้อมูลคำอธิบาย</h5>
                                    <div className="mb-3">
                                        <p className="form-label mb-1 fw-bold">คำอธิบาย:</p>
                                        <p>{prospect.description || '-'}</p>
                                    </div>
                                </div>

                                {/* Section: บันทึกย่อ */}
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>บันทึกย่อ</h5>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        {/*<input
                                            type="text"
                                            className="form-control rounded-3"
                                            placeholder="เพิ่มบันทึกย่อ..."
                                            style={{ borderColor: "#c2e9fb" }}
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddNote();
                                                }
                                            }}
                                        />
                                        <button
                                            className="btn btn-primary ms-2 rounded-3"
                                            style={{ background: "linear-gradient(45deg, #a1c4fd, #c2e9fb)", borderColor: "#a1c4fd", color: "#36454F" }}
                                            onClick={handleAddNote}
                                        >
                                            บันทึก
                                        </button>*/}
                                    </div>
                                    {/* Message display for notes */}
                                    {noteSaveMessage && (
                                        <div className={`alert ${noteSaveMessageType === 'success' ? 'alert-success' : 'alert-danger'} mt-3 mb-3`} role="alert">
                                            {noteSaveMessage}
                                        </div>
                                    )}
                                    {allLeadNotes.length === 0 ? (
                                        <p className="text-muted">ยังไม่มีบันทึกย่อสำหรับลูกค้ามุ่งหวังนี้</p>
                                    ) : (
                                        <ul className="list-group list-group-flush">
                                            {allLeadNotes.map((note) => (
                                                <li key={note.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div className="d-flex w-100 justify-content-between align-items-center">
                                                        <div>
                                                            <span className="fw-bold me-1" style={{ color: "#6a5acd" }}>[{note.source}]</span>
                                                            {note.text}
                                                            <small className="text-muted ms-2">({note.timestamp})</small>
                                                        </div>
                                                        <div>
                                                            {/* Redirect to AppointmentDetail for editing/deleting specific note */}
                                                            <button
                                                                className="btn btn-sm btn-outline-info"
                                                                style={{ borderColor: "#b0c4de", color: "#6a5acd" }}
                                                                onClick={() => handleViewTaskDetail(note.taskId)}
                                                            >
                                                                ดูรายละเอียดงาน
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Section: จังหวะเวลา */}
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>จังหวะเวลา</h5>
                                    <div className="d-flex justify-content-end mb-3">
                                        <button className="btn btn-outline-primary rounded-3" style={{ borderColor: "#b0c4de", color: "#6a5acd" }}>
                                            ลงทะเบียน
                                        </button>
                                    </div>
                                    <p className="text-muted">ไม่พบระเบียน</p>
                                </div>

                                {/* Section: สิ่งที่แนบมา */}
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>สิ่งที่แนบมา</h5>
                                    <div className="d-flex justify-content-end mb-3">
                                        <div className="dropdown">
                                            <button className="btn btn-outline-primary dropdown-toggle rounded-3" type="button" id="attachDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ borderColor: "#b0c4de", color: "#6a5acd" }}>
                                                แนบ
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby="attachDropdown">
                                                <li><a className="dropdown-item" href="#">อัปโหลดไฟล์</a></li>
                                                <li><a className="dropdown-item" href="#">แนบจาก Google Drive</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <p className="text-muted">ไม่มีสิ่งที่แนบมา</p>
                                </div>

                                {/* Section: ผลิตภัณฑ์ */}
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>ผลิตภัณฑ์</h5>
                                    <div className="d-flex justify-content-end mb-3">
                                        <button className="btn btn-outline-primary rounded-3" style={{ borderColor: "#b0c4de", color: "#6a5acd" }}>
                                            เพิ่มผลิตภัณฑ์
                                        </button>
                                    </div>
                                    <p className="text-muted">ไม่พบระเบียน</p>
                                </div>

                                {/* Section: กิจกรรมที่เปิดอยู่ (Open Activities) */}
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>กิจกรรมที่เปิดอยู่</h5>
                                    <div className="d-flex justify-content-end mb-3">
                                        <div className="dropdown">
                                            <button className="btn btn-outline-primary dropdown-toggle rounded-3" type="button" id="addActivityDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ borderColor: "#b0c4de", color: "#6a5acd" }}>
                                                เพิ่มใหม่
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby="addActivityDropdown">
                                                <li><a className="dropdown-item" href="#" onClick={handleShowCreateTaskModal}>งาน</a></li>
                                                <li><a className="dropdown-item" href="#">การประชุม</a></li>
                                                <li><a className="dropdown-item" href="#">การโทร</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    {loadingTasks && (
                                        <div className="text-center text-primary">
                                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                            กำลังโหลดงาน...
                                        </div>
                                    )}
                                    {tasksError && (
                                        <p className="text-danger">ข้อผิดพลาดในการโหลดงาน: {tasksError}</p>
                                    )}
                                    {!loadingTasks && !tasksError && openTasks.length === 0 && (
                                        <p className="text-muted">ไม่พบงานที่เปิดอยู่สำหรับลูกค้ามุ่งหวังนี้</p>
                                    )}
                                    {!loadingTasks && !tasksError && openTasks.length > 0 && (
                                        <div className="list-group">
                                            {openTasks.map(task => {
                                                console.log(`Task ID: ${task.id}, Raw Status: "${task.status}"`);
                                                return (
                                                    <div key={task.id} className="list-group-item list-group-item-action rounded-3 mb-2 shadow-sm" style={{ borderColor: "#e0eaff", backgroundColor: "#fcfdff" }}>
                                                        <div className="d-flex w-100 justify-content-between">
                                                            <h6 className="mb-1 fw-bold" style={{ color: "#4a4a4a" }}>
                                                                <Clipboard size={16} className="me-2 text-blue-500" />
                                                                {task.subject}
                                                            </h6>
                                                            <small className={`badge ${task.priority === 'สูง' ? 'bg-danger' : task.priority === 'ปานกลาง' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                                {task.priority}
                                                            </small>
                                                        </div>
                                                        <p className="mb-1 text-muted small">
                                                            <User size={14} className="me-1 text-green-500" />
                                                            เจ้าของ: {task.owner}
                                                        </p>
                                                        {task.dueDate && (
                                                            <p className="mb-1 text-muted small">
                                                                <Calendar size={14} className="me-1 text-red-500" />
                                                                วันครบกำหนด: {formatDate(task.dueDate)}
                                                            </p>
                                                        )}
                                                        {task.reminder && (
                                                            <p className="mb-1 text-muted small">
                                                                <Bell size={14} className="me-1 text-yellow-500" />
                                                                ตัวเตือน:
                                                                {task.reminderTime && (
                                                                    <>
                                                                        <Clock size={14} className="ms-2 me-1 text-gray-500" />
                                                                        {formatTimeSpan(task.reminderTime)}
                                                                    </>
                                                                )}
                                                                {task.reminderMethod && (
                                                                    <span className="ms-2">({task.reminderMethod})</span>
                                                                )}
                                                            </p>
                                                        )}
                                                        <p className="mb-1 text-muted small">
                                                            <CheckSquare size={14} className="me-1 text-blue-500" />
                                                            สถานะ: {statusLabels[task.status] || task.status || '-'}
                                                        </p>
                                                        {task.description && (
                                                            <p className="mb-1 text-muted small">
                                                                <Info size={14} className="me-1 text-purple-500" />
                                                                คำอธิบาย: {task.description}
                                                            </p>
                                                        )}
                                                        {task.attachments && (
                                                            <p className="mb-1 text-muted small">
                                                                <Paperclip size={14} className="me-1 text-orange-500" />
                                                                สิ่งที่แนบมา: {task.attachments}
                                                            </p>
                                                        )}
                                                        {task.closedAt && (
                                                            <p className="mb-1 text-muted small">
                                                                <Clock size={14} className="me-1 text-gray-500" />
                                                                ปิดเมื่อ: {formatClosedAt(task.closedAt)}
                                                            </p>
                                                        )}
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <small className="text-muted">
                                                                {task.reminder && <span className="badge bg-info me-1">เตือนความจำ</span>}
                                                                {task.repeat !== 'None' && task.repeat && <span className="badge bg-secondary">ทำซ้ำ: {task.repeat}</span>}
                                                            </small>
                                                            <div>
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary me-1"
                                                                    style={{ borderColor: "#b0c4de", color: "#6a5acd" }}
                                                                    onClick={() => window.open(generateGoogleCalendarUrl(task), '_blank')}
                                                                >
                                                                    เพิ่มในปฏิทิน
                                                                </button>
                                                                {task.status !== 'Completed' && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-success me-1"
                                                                        style={{ borderColor: "#28a745", color: "#28a745" }}
                                                                        onClick={() => confirmCloseTask(task.id)}
                                                                    >
                                                                        ปิดงาน
                                                                    </button>
                                                                )}
                                                                <button className="btn btn-sm btn-outline-info me-1"
                                                                    style={{ borderColor: "#b0c4de", color: "#6a5acd" }}
                                                                    onClick={() => handleViewTaskDetail(task.id)}
                                                                >
                                                                    ดูรายละเอียด</button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    style={{ borderColor: "#dc3545", color: "#dc3545" }}
                                                                    onClick={() => confirmDeleteTask(task.id)}
                                                                >
                                                                    ลบ
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Section: กิจกรรมที่ปิดแล้ว */}
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>กิจกรรมที่ปิดแล้ว</h5>
                                    {loadingTasks && (
                                        <div className="text-center text-primary">
                                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                            กำลังโหลดงาน...
                                        </div>
                                    )}
                                    {tasksError && (
                                        <p className="text-danger">ข้อผิดพลาดในการโหลดงาน: {tasksError}</p>
                                    )}
                                    {!loadingTasks && !tasksError && closedTasks.length === 0 && (
                                        <p className="text-muted">ไม่พบงานที่ปิดแล้วสำหรับลูกค้ามุ่งหวังนี้</p>
                                    )}
                                    {!loadingTasks && !tasksError && closedTasks.length > 0 && (
                                        <div className="list-group">
                                            {closedTasks.map(task => (
                                                <div key={task.id} className="list-group-item list-group-item-action rounded-3 mb-2 shadow-sm" style={{ borderColor: "#e0eaff", backgroundColor: "#fcfdff" }}>
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h6 className="mb-1 fw-bold" style={{ color: "#4a4a4a" }}>
                                                            <Clipboard size={16} className="me-2 text-blue-500" />
                                                            {task.subject}
                                                        </h6>
                                                        <small className={`badge ${task.priority === 'สูง' ? 'bg-danger' : task.priority === 'ปานกลาง' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                            {task.priority}
                                                        </small>
                                                    </div>
                                                    <p className="mb-1 text-muted small">
                                                        <User size={14} className="me-1 text-green-500" />
                                                        เจ้าของ: {task.owner}
                                                    </p>
                                                    {task.dueDate && (
                                                        <p className="mb-1 text-muted small">
                                                            <Calendar size={14} className="me-1 text-red-500" />
                                                            วันครบกำหนด: {formatDate(task.dueDate)}
                                                        </p>
                                                    )}
                                                    {task.reminder && (
                                                        <p className="mb-1 text-muted small">
                                                            <Bell size={14} className="me-1 text-yellow-500" />
                                                            ตัวเตือน:
                                                            {task.reminderTime && (
                                                                <>
                                                                    <Clock size={14} className="ms-2 me-1 text-gray-500" />
                                                                    {formatTimeSpan(task.reminderTime)}
                                                                </>
                                                            )}
                                                            {task.reminderMethod && (
                                                                <span className="ms-2">({task.reminderMethod})</span>
                                                            )}
                                                        </p>
                                                    )}
                                                    <p className="mb-1 text-muted small">
                                                        <CheckSquare size={14} className="me-1 text-blue-500" />
                                                        สถานะ: {statusLabels[task.status] || task.status || '-'}
                                                    </p>
                                                    {task.description && (
                                                        <p className="mb-1 text-muted small">
                                                            <Info size={14} className="me-1 text-purple-500" />
                                                            คำอธิบาย: {task.description}
                                                        </p>
                                                    )}
                                                    {task.attachments && (
                                                        <p className="mb-1 text-muted small">
                                                            <Paperclip size={14} className="me-1 text-orange-500" />
                                                            สิ่งที่แนบมา: {task.attachments}
                                                        </p>
                                                    )}
                                                    {task.closedAt && (
                                                        <p className="mb-1 text-muted small">
                                                            <Clock size={14} className="me-1 text-gray-500" />
                                                            ปิดเมื่อ: {formatClosedAt(task.closedAt)}
                                                        </p>
                                                    )}
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <small className="text-muted">
                                                            {task.reminder && <span className="badge bg-info me-1">เตือนความจำ</span>}
                                                            {task.repeat !== 'None' && task.repeat && <span className="badge bg-secondary">ทำซ้ำ: {task.repeat}</span>}
                                                        </small>
                                                        <div>
                                                            <button className="btn btn-sm btn-outline-info me-1"
                                                                style={{ borderColor: "#b0c4de", color: "#6a5acd" }}
                                                                onClick={() => handleViewTaskDetail(task.id)}
                                                            >
                                                                ดูรายละเอียด</button>

                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                style={{ borderColor: "#dc3545", color: "#dc3545" }}
                                                                onClick={() => confirmDeleteTask(task.id)}
                                                            >
                                                                ลบ
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Section: ได้เชิญ การประชุม */}
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>ได้เชิญ การประชุม</h5>
                                    <p className="text-muted">ไม่พบระเบียน</p>
                                </div>

                                {/* Section: อีเมล */}
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>อีเมล</h5>
                                    <div className="d-flex justify-content-end mb-3">
                                        <button className="btn btn-outline-primary rounded-3" style={{ borderColor: "#b0c4de", color: "#6a5acd" }}>
                                            เขียนอีเมล
                                        </button>
                                    </div>
                                    <p className="text-muted">ไม่พบระเบียน</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "timeline" && (
                        <div className="row justify-content-center">
                            <div className="col-md-12">
                                <div className="card p-4 shadow-lg rounded-4 border-0 fade-in" style={{ backgroundColor: "#fdfdff" }}>
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>ไทม์ไลน์กิจกรรม</h5>
                                    <p className="text-muted">ยังไม่มีกิจกรรมในไทม์ไลน์สำหรับลูกค้ามุ่งหวังนี้</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* ปุ่ม "ย้อนกลับ" ที่ด้านล่าง */}
                <div className="flex-shrink-0 px-4 py-3" style={{ background: "#f3f7fb", borderTop: "1px solid #e0eaff" }}>
                    <button className="btn btn-secondary rounded-3" onClick={handleGoBack}>
                        ย้อนกลับ
                    </button>
                </div>
            </div>

            {/* Render the CreateTaskModal component */}
            <CreateTaskModal
                show={showCreateTaskModal}
                onHide={handleCloseCreateTaskModal}
                leadId={leadID}
            />

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>ยืนยันการลบ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>
                        ยกเลิก
                    </Button>
                    <Button variant="danger" onClick={handleDeleteTask}>
                        ลบ
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Close Task Confirmation Modal */}
            <Modal show={showCloseConfirmModal} onHide={() => setShowCloseConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>ยืนยันการปิดงาน</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    คุณแน่ใจหรือไม่ว่าต้องการปิดงานนี้?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCloseConfirmModal(false)}>
                        ยกเลิก
                    </Button>
                    <Button variant="success" onClick={handleCloseTask}>
                        ปิดงาน
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
