import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Dropdown, Modal } from 'react-bootstrap';
import CRMSidebar from '../components/CRMSidebar';
import CreateTaskModal from './CreateTaskModal'; // Assuming CreateTaskModal is available
import { User, Building, Mail, Phone, MapPin, FileText, Calendar, Globe, Twitter, MessageSquare, Info, Edit, Trash2, ChevronLeft, Clipboard, Bell, Repeat, Clock, Paperclip, CheckSquare } from 'lucide-react';

export default function CRMContactsDetail() {
    const { contactId } = useParams();
    const navigate = useNavigate();

    const [contactData, setContactData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [showFullDetails, setShowFullDetails] = useState(true);

    // State for Tasks related to this contact
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

    // States for notes management
    const [newNote, setNewNote] = useState("");
    const [allContactNotes, setAllContactNotes] = useState([]); // To store all parsed notes from all tasks
    const [noteSaveMessage, setNoteSaveMessage] = useState(null);
    const [noteSaveMessageType, setNoteSaveMessageType] = useState(null); // 'success' or 'error'

    const API_URL = "https://localhost:7274/api/contacts"; // API for contacts
    const TASKS_API_URL = "https://localhost:7274/api/tasks"; // API for tasks

    // Mapping of internal status values to display labels (Thai)
    const statusLabels = {
        Open: "เปิด",
        NotStarted: "ไม่ได้เริ่ม",
        Postponed: "เลื่อนเวลา",
        InProgress: "กำลังคืบหน้า",
        Completed: "เสร็จสมบูรณ์",
        WaitingInput: "รอข้อมูลอินพุต",
        Closed: "ปิดแล้ว"
    };

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

    // Function to fetch contact data
    const fetchContactDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log(`[CRMContactsDetail] Fetching contact data from: ${API_URL}/${contactId}`);
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
                        console.error("[fetchContactDetail] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[fetchContactDetail] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }
            const rawData = await response.json();
            console.log("Fetched raw contact data:", rawData);

            // Transform keys from camelCase (from backend) to PascalCase (for React state)
            const transformedData = transformKeysToPascalCase(rawData);
            setContactData(transformedData);
            console.log("contactData state updated with (transformed):", transformedData);

        } catch (err) {
            console.error("Failed to load contact data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [contactId]);

    // Function to fetch tasks for the current contact and extract notes
    const fetchTasksForContact = useCallback(async () => {
        if (!contactId) {
            setTasksError("Contact ID is missing, cannot fetch tasks.");
            return;
        }
        setLoadingTasks(true);
        setTasksError(null);
        console.log(`[fetchTasksForContact] Attempting to fetch tasks for contactId: ${contactId}`);
        try {
            const cacheBuster = new Date().getTime();
            // Assuming the backend correctly filters by contactId when this parameter is present
            const response = await fetch(`${TASKS_API_URL}?contactId=${contactId}&_=${cacheBuster}`);
            if (!response.ok) {
                let errorDetails = `Failed to fetch tasks: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[fetchTasksForContact] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[fetchTasksForContact] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }
            const data = await response.json();
            console.log(`[fetchTasksForContact] Successfully fetched tasks for contact ${contactId}:`, data);

            // Filter tasks to ensure they are truly related to this contact and not a lead
            // This is a client-side filter to handle cases where backend might return tasks
            // that are also associated with a LeadId, even if queried by ContactId.
            const contactSpecificTasks = data.filter(task =>
                task.contactId === parseInt(contactId) && // Ensure contactId matches the current contact
                (task.leadId === null || task.leadId === 0 || task.leadId === undefined) // Ensure it's NOT associated with a lead
            );

            setTasks(contactSpecificTasks); // Set tasks to the filtered list

            // Extract and parse notes from filtered tasks
            const tempAllNotes = [];
            contactSpecificTasks.forEach(task => { // Use contactSpecificTasks here
                if (task.notesContent && typeof task.notesContent === 'string') {
                    const parsedNotes = task.notesContent.split('\n').filter(line => line.trim() !== '').map((line, index) => {
                        const sourceMatch = line.match(/^\[(.*?)\]\s*(.*)\s+\((.*)\)$/);
                        if (sourceMatch && sourceMatch.length === 4) {
                            return {
                                id: `note-${task.id}-${index}-${Date.now()}`,
                                taskId: task.id,
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
            setAllContactNotes(tempAllNotes);

        } catch (err) {
            console.error(`[fetchTasksForContact] Error fetching tasks for contact ${contactId}:`, err);
            setTasksError(err.message);
        } finally {
            setLoadingTasks(false);
        }
    }, [contactId]); // Depend on contactId

    // Initial fetch for contact details
    useEffect(() => {
        if (contactId) {
            fetchContactDetail();
        } else {
            setLoading(false);
            setError("ไม่พบ Contact ID ที่ส่งมา");
            console.error("CRMContactsDetail: contactId is undefined or null.");
        }
    }, [contactId, fetchContactDetail]);

    // Fetch tasks when contactId changes or when the modal is closed (after task creation)
    useEffect(() => {
        if (contactId) {
            fetchTasksForContact();
        }
    }, [contactId, fetchTasksForContact]);

    const handleGoBack = () => {
        window.history.back();
    };

    // Functions to open and close the Create Task Modal
    const handleShowCreateTaskModal = () => setShowCreateTaskModal(true);
    const handleCloseCreateTaskModal = () => {
        console.log('[handleCloseCreateTaskModal] Modal is closing, triggering task refresh.');
        setShowCreateTaskModal(false);
        fetchTasksForContact(); // Refresh tasks after modal is closed (assuming a task might have been created)
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
            fetchTasksForContact(); // Refresh the list of tasks and notes
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
            fetchTasksForContact(); // Refresh the list of tasks and notes
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

        if (!newNote.trim() || !contactData || !contactData.Id) {
            console.warn("[handleAddNote] Cannot add empty note or contact/contactId is missing.", { newNote, contactData });
            setNoteSaveMessage("ไม่สามารถเพิ่มบันทึกย่อว่างเปล่าได้ หรือข้อมูลผู้ติดต่อไม่สมบูรณ์.");
            setNoteSaveMessageType('error');
            return;
        }

        const noteText = newNote.trim();
        const currentTimestamp = new Date().toLocaleString('th-TH');
        const sourceInfo = `ผู้ติดต่อ - ${contactData.FirstName || ''} ${contactData.LastName || ''}`;

        const fullNoteEntry = `[${sourceInfo}] ${noteText} (${currentTimestamp})`;

        // Prepare new task data for API call (to create a task specifically for this note)
        const newTaskData = {
            Subject: `บันทึกย่อสำหรับผู้ติดต่อ: ${contactData.FirstName || ''} ${contactData.LastName || ''}`,
            DueDate: null, // No specific due date for a general note task
            Priority: 'ต่ำ', // Default low priority for a general note
            Owner: 'Supap Nonkaew', // Default owner
            Reminder: false,
            ReminderTime: null,
            ReminderMethod: null,
            Repeat: 'None',
            ContactId: parseInt(contactId), // Use ContactId for tasks related to contacts
            LeadId: null, // Explicitly set LeadId to null to ensure it's a contact-specific task
            Status: 'Open', // A note task is 'Open' by default
            Description: 'บันทึกย่อทั่วไปที่เพิ่มจากหน้ารายละเอียดผู้ติดต่อ',
            Attachments: null, // Attachments are separate
            NotesContent: fullNoteEntry, // Store the new note here
            ClosedAt: null,
        };

        setLoading(true); // Indicate loading for the API call (general page loading)
        setError(null); // Clear general page error

        try {
            console.log(`[handleAddNote] Attempting to create new task for note for contact ID: ${contactId}.`, newTaskData);
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

            console.log(`[handleAddNote] Successfully added note (created new task) for contact ID: ${contactId}.`);
            setNoteSaveMessage("บันทึกย่อถูกเพิ่มเรียบร้อยแล้ว!");
            setNoteSaveMessageType('success');
            setNewNote(""); // Clear the input field
            fetchTasksForContact(); // Refresh the list of tasks and notes

        } catch (err) {
            console.error(`[handleAddNote] Error adding note (creating task) for contact ID ${contactId}:`, err);
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
                <p className="ms-2">กำลังโหลดรายละเอียดผู้ติดต่อ...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <p className="text-danger mb-2">ข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
                <button className="btn btn-primary" onClick={() => navigate('/crm-contacts')}>กลับไปรายการ</button>
            </div>
        );
    }

    if (!contactData) {
        return (
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <p className="text-muted">ไม่พบข้อมูลผู้ติดต่อ</p>
                <button className="btn btn-primary" onClick={() => navigate('/crm-contacts')}>กลับไปรายการ</button>
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
                {/* Fixed Header: Contact Name, Action Buttons */}
                <div className="container-fluid py-3 px-4 flex-shrink-0" style={{ background: "#f3f7fb", zIndex: 1, borderBottom: "1px solid #e0eaff" }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="fw-bold" style={{ color: "#8a2be2" }}>
                            <ChevronLeft size={24} className="me-2 cursor-pointer" onClick={() => navigate(-1)} style={{ verticalAlign: 'middle' }} />
                            👤 {contactData.Prefix} {contactData.FirstName} {contactData.LastName}
                        </h4>
                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant="outline-primary"
                                className="rounded-3 px-4 py-2"
                                onClick={() => navigate(`/crm-contact-form/${contactId}`)}
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
                                onClick={() => console.log(`Delete contact ${contactId}`)} // Implement actual delete confirmation modal
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
                </div>

                {/* Tab Navigation (Overview, Timeline) - Fixed */}
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

                {/* Scrollable Content Area */}
                <div className="flex-grow-1 overflow-auto px-4 py-3" style={{ paddingBottom: '2rem' }}>
                    {activeTab === "overview" && (
                        <div className="row justify-content-center">
                            <div className="col-md-12">


                                {/* ผู้ติดต่อ (Contact Person) - Assuming it's part of the Account object for simplicity */}
                                <Col md={12}>
                                    <Card className="shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                        <Card.Body className="p-4">
                                            <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                                <User size={20} className="me-2 text-primary" />ข้อมูลย่อ
                                            </h5>
                                            <Row>
                                                <div className="col-md-12">
                                                    <p className="form-label mb-1 fw-bold">เจ้าของ ผู้ติดต่อ:</p>
                                                    <p>{contactData.Owner || '-'}</p>
                                                </div>
                                                <div className="col-md-12">
                                                    <p className="form-label mb-1 fw-bold">อีเมล:</p>
                                                    <p>{contactData.Email || '-'}</p>
                                                </div>
                                                <div className="col-md-12">
                                                    <p className="form-label mb-1 fw-bold">โทรศัพท์:</p>
                                                    <p>{contactData.Phone || '-'}</p>
                                                </div>
                                                <div className="col-md-12">
                                                    <p className="form-label mb-1 fw-bold">โทรศัพท์มือถือ:</p>
                                                    <p>{contactData.Mobile || '-'}</p>
                                                </div>
                                                <div className="col-md-12">
                                                    <p className="form-label mb-1 fw-bold">แผนก:</p>
                                                    <p>{contactData.Department || '-'}</p>
                                                </div>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* === Section: Contact Information === */}
                                <Card className="shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <Card.Body className="p-4">
                                        <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                            <User size={20} className="me-2 text-primary" />ข้อมูลผู้ติดต่อ
                                        </h5>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">เจ้าของ ผู้ติดต่อ:</p>
                                                    <p>{contactData.Owner || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">ชื่อบัญชี:</p>
                                                    <p>{contactData.AccountName || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">อีเมล:</p>
                                                    <p>{contactData.Prefix || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">โทรศัพท์:</p>
                                                    <p>{contactData.FirstName || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">โทรศัพท์อื่นๆ:</p>
                                                    <p>{contactData.LastName || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">โทรศัพท์มือถือ:</p>
                                                    <p>{contactData.Email || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">ผู้ช่วย:</p>
                                                    <p>{contactData.Phone || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">สร้างโดย:</p>
                                                    <p>{contactData.CreatedAt ? new Date(contactData.CreatedAt).toLocaleString('th-TH') : '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">แก้ไขโดย:</p>
                                                    <p>{contactData.UpdatedAt ? new Date(contactData.UpdatedAt).toLocaleString('th-TH') : '-'}</p>
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">แหล่งที่มา ลูกค้ามุ่งหวัง:</p>
                                                    <p>{contactData.Assistant || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">ชื่อ ผู้ติดต่อ:</p>
                                                    <p>{contactData.FirstName || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">ชื่อ ผู้ขาย:</p>
                                                    <p>{contactData.LeadSource || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">ชื่อ:</p>
                                                    <p>{contactData.SalespersonName || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">แผนก:</p>
                                                    <p>{contactData.Title || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">โทรศัพท์บ้าน:</p>
                                                    <p>{contactData.Department || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">แฟกซ์:</p>
                                                    <p>{contactData.DateOfBirth ? formatDate(contactData.DateOfBirth) : '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">วันเกิด:</p>
                                                    <p>{contactData.SkypeID || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">โทรศัพท์ของผู้ช่วย:</p>
                                                    <p>{contactData.Twitter || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">เลือกไม่รับอีเมล:</p>
                                                    <p>{contactData.OptOutEmail ? 'ใช่' : 'ไม่'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">ไอดี Skype:</p>
                                                    <p>{contactData.Twitter || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">อีเมลสำรอง:</p>
                                                    <p>{contactData.Twitter || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">ผู้บังคับบัญชา:</p>
                                                    <p>{contactData.Twitter || '-'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-muted mb-1">Twitter:</p>
                                                    <p>{contactData.Twitter || '-'}</p>
                                                </div>
                                            </Col>
                                            <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                            <MapPin size={20} className="me-2 text-warning" />ข้อมูลที่อยู่
                                        </h5>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <h6 className="fw-bold mb-3 text-secondary">ที่อยู่สำหรับจัดส่ง</h6>
                                                <div className="mb-2">
                                                    <p className="text-muted mb-1">ถนน:</p>
                                                    <p>{contactData.DeliveryStreet || '-'}</p>
                                                </div>
                                                <div className="mb-2">
                                                    <p className="text-muted mb-1">อำเภอ:</p>
                                                    <p>{contactData.DeliveryDistrict || '-'}</p>
                                                </div>
                                                <div className="mb-2">
                                                    <p className="text-muted mb-1">จังหวัด:</p>
                                                    <p>{contactData.DeliveryProvince || '-'}</p>
                                                </div>
                                                <div className="mb-2">
                                                    <p className="text-muted mb-1">รหัสไปรษณีย์:</p>
                                                    <p>{contactData.DeliveryZipCode || '-'}</p>
                                                </div>
                                                <div className="mb-2">
                                                    <p className="text-muted mb-1">ประเทศ:</p>
                                                    <p>{contactData.DeliveryCountry || '-'}</p>
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <h6 className="fw-bold mb-3 text-secondary">ที่อยู่อื่นๆ</h6>
                                                <div className="mb-2">
                                                    <p className="text-muted mb-1">ถนนอื่นๆ:</p>
                                                    <p>{contactData.OtherStreet || '-'}</p>
                                                </div>
                                                <div className="mb-2">
                                                    <p className="text-muted mb-1">อำเภออื่นๆ:</p>
                                                    <p>{contactData.OtherDistrict || '-'}</p>
                                                </div>
                                                <div className="mb-2">
                                                    <p className="text-muted mb-1">จังหวัดอื่นๆ:</p>
                                                    <p>{contactData.OtherProvince || '-'}</p>
                                                </div>
                                                <div className="mb-2">
                                                    <p className="text-muted mb-1">รหัสไปรษณีย์อื่นๆ:</p>
                                                    <p>{contactData.OtherZipCode || '-'}</p>
                                                </div>
                                                <div className="mb-2">
                                                    <p className="text-muted mb-1">ประเทศอื่นๆ:</p>
                                                    <p>{contactData.OtherCountry || '-'}</p>
                                                </div>
                                            </Col>
                                            <h5 className="fw-bold mb-4" style={{ color: "#6a5acd" }}>
                                            <FileText size={20} className="me-2 text-info" />ข้อมูลคำอธิบาย
                                        </h5>
                                        <p className="text-muted mb-1">คำอธิบาย:</p>
                                        <p>{contactData.Description || '-'}</p>
                                        </Row>
                                        </Row>
                                    </Card.Body>
                                </Card>


                                {/* Section: บันทึกย่อ */}
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h5 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>บันทึกย่อ</h5>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <input
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
                                        </button>
                                    </div>
                                    {/* Message display for notes */}
                                    {noteSaveMessage && (
                                        <div className={`alert ${noteSaveMessageType === 'success' ? 'alert-success' : 'alert-danger'} mt-3 mb-3`} role="alert">
                                            {noteSaveMessage}
                                        </div>
                                    )}
                                    {allContactNotes.length === 0 ? (
                                        <p className="text-muted">ยังไม่มีบันทึกย่อสำหรับผู้ติดต่อนี้</p>
                                    ) : (
                                        <ul className="list-group list-group-flush">
                                            {allContactNotes.map((note) => (
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
                                        <p className="text-muted">ไม่พบงานที่เปิดอยู่สำหรับผู้ติดต่อนี้</p>
                                    )}
                                    {!loadingTasks && !tasksError && openTasks.length > 0 && (
                                        <div className="list-group">
                                            {openTasks.map(task => {
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
                                        <p className="text-muted">ไม่พบงานที่ปิดแล้วสำหรับผู้ติดต่อนี้</p>
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
                                    <p className="text-muted">ยังไม่มีกิจกรรมในไทม์ไลน์สำหรับผู้ติดต่อนี้</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* "Back" button at the bottom */}
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
                contactId={contactId} // Pass contactId instead of leadId
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
