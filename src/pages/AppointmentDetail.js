import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CRMSidebar from "../components/CRMSidebar";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Calendar, Clipboard, User, Bell, Repeat, Clock, Info, Paperclip, CheckSquare, Edit, ArrowLeft, ChevronUp, ChevronDown, Download } from 'lucide-react'; // Import Download icon
import { Modal, Button } from 'react-bootstrap'; // ตรวจสอบให้แน่ใจว่าได้ import Modal และ Button ที่นี่

export default function AppointmentDetail() {
    const { taskId } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [prospect, setProspect] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Modals (Delete, Close, Confirm Notification)
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [showConfirmNotificationModal, setShowConfirmNotificationModal] = useState(false);

    // States to control visibility of sections
    const [showTaskDetails, setShowTaskDetails] = useState(true);

    // State for notes input and display
    const [newNote, setNewNote] = useState("");
    const [notes, setNotes] = useState([]);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingNoteText, setEditingNoteText] = useState("");
    const [noteToDeleteId, setNoteToDeleteId] = useState(null);
    const [noteSaveMessage, setNoteSaveMessage] = useState(null);
    const [noteSaveMessageType, setNoteSaveMessageType] = useState(null);

    // States for attachments
    const [newAttachmentFile, setNewAttachmentFile] = useState(null); // Stores the File object
    const [uploadedFiles, setUploadedFiles] = useState([]); // Stores [{ id, name, data (Base64) }]
    const [attachmentSaveMessage, setAttachmentSaveMessage] = useState(null);
    const [attachmentSaveMessageType, setAttachmentSaveMessageType] = useState(null);
    const [attachmentToDeleteId, setAttachmentToDeleteId] = useState(null); // Use ID for deletion

    const API_URL = "https://localhost:7274/api/leads";
    const TASKS_API_URL = "https://localhost:7274/api/tasks";

    const statusLabels = {
        Open: "เปิด",
        NotStarted: "ไม่ได้เริ่ม",
        Postponed: "เลื่อนเวลา",
        InProgress: "กำลังคืบหน้า",
        Completed: "เสร็จสมบูรณ์",
        WaitingInput: "รอข้อมูลอินพุต",
        Closed: "ปิดแล้ว"
    };

    // Helper function to update task notes in the database
    const updateTaskNotes = async (updatedNotesArray) => {
        if (!task || !task.id) {
            console.error("Task or Task ID is missing for updating notes.");
            return;
        }

        const notesString = updatedNotesArray.map(n => `[${n.source}] ${n.text} (${n.timestamp})`).join('\n');

        const updatedTaskData = {
            ...task,
            NotesContent: notesString,
        };

        setLoading(true);
        setError(null);

        try {
            console.log(`[updateTaskNotes] Attempting to update task ID: ${task.id} notes content.`, updatedTaskData);
            const response = await fetch(`${TASKS_API_URL}/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTaskData),
            });

            if (!response.ok) {
                let errorDetails = `Failed to update task notes content: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[updateTaskNotes] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[updateTaskNotes] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }

            console.log(`[updateTaskNotes] Successfully updated task ID: ${task.id} notes content.`);
            await fetchTaskDetail();
        } catch (err) {
            console.error(`[updateTaskNotes] Error updating task ID ${task.id} notes content:`, err);
            setError(`Failed to update notes: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Helper function to update task attachments in the database
    const updateTaskAttachmentsInDb = async (updatedAttachmentsArray) => {
        if (!task || !task.id) {
            console.error("Task or Task ID is missing for updating attachments.");
            return;
        }

        // Convert the array of attachment objects back to a JSON string for storage
        const attachmentsString = JSON.stringify(updatedAttachmentsArray);

        const updatedTaskData = {
            ...task,
            Attachments: attachmentsString,
        };

        setLoading(true);
        setError(null);

        try {
            console.log(`[updateTaskAttachmentsInDb] Attempting to update task ID: ${task.id} attachments.`, updatedTaskData);
            const response = await fetch(`${TASKS_API_URL}/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTaskData),
            });

            if (!response.ok) {
                let errorDetails = `Failed to update task attachments: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[updateTaskAttachmentsInDb] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[updateTaskAttachmentsInDb] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }

            console.log(`[updateTaskAttachmentsInDb] Successfully updated task ID: ${task.id} attachments.`);
            await fetchTaskDetail();
        } catch (err) {
            console.error(`[updateTaskAttachmentsInDb] Error updating task ID ${task.id} attachments:`, err);
            setError(`Failed to update attachments: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    // Function to fetch a single task by ID
    const fetchTaskDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("Fetching task detail for ID:", taskId);
            const response = await fetch(`${TASKS_API_URL}/${taskId}`);

            if (!response.ok) {
                let errorDetails = `Failed to fetch task detail: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[AppointmentDetail] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[AppointmentDetail] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }
            const data = await response.json();
            console.log("Fetched task data:", data);
            setTask(data);

            // Initialize notes from task.notesContent
            if (data.notesContent && typeof data.notesContent === 'string') {
                const parsedNotes = data.notesContent.split('\n').filter(line => line.trim() !== '').map((line, index) => {
                    const sourceMatch = line.match(/^\[(.*?)\]\s*(.*)\s+\((.*)\)$/);
                    if (sourceMatch && sourceMatch.length === 4) {
                        return {
                            id: `initial-note-${index}-${Date.now()}`,
                            source: sourceMatch[1].trim(),
                            text: sourceMatch[2].trim(),
                            timestamp: sourceMatch[3].trim()
                        };
                    }
                    const simpleMatch = line.match(/(.*)\s+\((.*)\)$/);
                    if (simpleMatch && simpleMatch.length === 3) {
                        return {
                            id: `initial-note-${index}-${Date.now()}`,
                            source: 'ไม่ระบุที่มา',
                            text: simpleMatch[1].trim(),
                            timestamp: simpleMatch[2].trim()
                        };
                    }
                    return {
                        id: `initial-note-${index}-${Date.now()}`,
                        source: 'ไม่ระบุที่มา',
                        text: line.trim(),
                        timestamp: new Date().toLocaleString('th-TH')
                    };
                });
                setNotes(parsedNotes);
            } else {
                setNotes([]);
            }

            // Initialize attachments from task.attachments
            if (data.attachments && typeof data.attachments === 'string') {
                try {
                    const parsedAttachments = JSON.parse(data.attachments);
                    if (Array.isArray(parsedAttachments)) {
                        setUploadedFiles(parsedAttachments);
                    } else {
                        console.warn("Attachments data is not a valid JSON array:", data.attachments);
                        setUploadedFiles([]);
                    }
                } catch (e) {
                    console.error("Failed to parse attachments JSON:", e, data.attachments);
                    setUploadedFiles([]);
                }
            } else {
                setUploadedFiles([]);
            }


            // Fetch related prospect data if leadId exists in the task
            if (data.leadId) {
                console.log("Fetching prospect for leadId:", data.leadId);
                const prospectResponse = await fetch(`${API_URL}/${data.leadId}`);
                if (!prospectResponse.ok) {
                    console.warn(`Failed to fetch prospect for leadId ${data.leadId}: ${prospectResponse.status}`);
                    setProspect(null);
                } else {
                    const prospectData = await prospectResponse.json();
                    setProspect(prospectData);
                    console.log("Fetched prospect data for task:", prospectData);
                }
            } else {
                setProspect(null);
            }

        } catch (err) {
            console.error("Failed to fetch task detail:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        if (taskId) {
            fetchTaskDetail();
        } else {
            setLoading(false);
            setError("ไม่พบ Task ID ที่ส่งมา");
            console.error("AppointmentDetail: taskId is undefined or null.");
        }
    }, [taskId, fetchTaskDetail]);

    const handleGoBack = () => {
        navigate(-1);
    };

    // Function to handle navigation to the edit task page
    const handleEditTask = () => {
        if (task && task.id) {
            navigate(`/crm-edit-appointment/${task.id}`);
        } else {
            console.warn("Cannot edit task: Task ID is missing.");
        }
    };

    // Functions to handle Delete Task
    const confirmDeleteTask = () => {
        setShowDeleteConfirmModal(true);
    };

    const handleDeleteTask = async () => {
        if (!task || !task.id) return;

        setShowDeleteConfirmModal(false);
        setLoading(true);
        setError(null);

        try {
            console.log(`[handleDeleteTask] Attempting to delete task ID: ${task.id}`);
            const response = await fetch(`${TASKS_API_URL}/${task.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                let errorDetails = `Failed to fetch task detail: ${response.status}`;
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

            console.log(`[handleDeleteTask] Successfully deleted task ID: ${task.id}`);
            navigate(-1);
        } catch (err) {
            console.error(`[handleDeleteTask] Error deleting task ID ${task.id}:`, err);
            setError(`Failed to delete task: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Functions to handle Close Task
    const confirmCloseTask = () => {
        setShowCloseConfirmModal(true);
    };

    const handleCloseTask = async () => {
        if (!task || !task.id) return;

        setShowCloseConfirmModal(false);
        setLoading(true);
        setError(null);

        try {
            const updatedTaskData = {
                ...task,
                Status: "Completed",
                ClosedAt: new Date().toISOString(),
            };

            console.log(`[handleCloseTask] Attempting to close task ID: ${task.id} with data:`, updatedTaskData);

            const response = await fetch(`${TASKS_API_URL}/${task.id}`, {
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

            console.log(`[handleCloseTask] Successfully closed task ID: ${task.id}`);
            fetchTaskDetail();
        } catch (err) {
            console.error(`[handleCloseTask] Error closing task ID ${task.id}:`, err);
            setError(`Failed to close task: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Functions to handle Confirm Notification
    const confirmNotification = () => {
        setShowConfirmNotificationModal(true);
    };

    const handleConfirmNotification = async () => {
        if (!task || !task.id) return;

        setShowConfirmNotificationModal(false);
        setLoading(true);
        setError(null);

        try {
            const updatedTaskData = {
                ...task,
                IsNotified: true,
            };

            console.log(`[handleConfirmNotification] Attempting to confirm notification for task ID: ${task.id} with data:`, updatedTaskData);

            const response = await fetch(`${TASKS_API_URL}/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTaskData),
            });

            if (!response.ok) {
                let errorDetails = `Failed to confirm notification: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errorData = await response.json();
                        errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
                    } catch (jsonError) {
                        errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
                        console.error("[handleConfirmNotification] Failed to parse JSON error response:", jsonError);
                    }
                } else {
                    errorDetails = await response.text();
                    console.error("[handleConfirmNotification] Non-JSON error response:", errorDetails);
                }
                throw new Error(errorDetails);
            }

            console.log(`[handleConfirmNotification] Successfully confirmed notification for task ID: ${task.id}`);
            fetchTaskDetail();
        } catch (err) {
            console.error(`[handleConfirmNotification] Error confirming notification for task ID ${task.id}:`, err);
            setError(`Failed to confirm notification: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle adding a new note and saving it to NotesContent
    const handleAddNote = async () => {
        setNoteSaveMessage(null);
        setNoteSaveMessageType(null);

        if (!newNote.trim() || !task || !task.id) {
            console.warn("[handleAddNote] Cannot add empty note or task/taskId is missing.", { newNote, task });
            setNoteSaveMessage("ไม่สามารถเพิ่มบันทึกย่อว่างเปล่าได้ หรือข้อมูลงานไม่สมบูรณ์.");
            setNoteSaveMessageType('error');
            return;
        }

        const noteText = newNote.trim();
        const currentTimestamp = new Date().toLocaleString('th-TH');
        const sourceInfo = `งาน - ${task.subject || 'ไม่ระบุหัวข้อ'}`;

        const fullNoteEntry = `[${sourceInfo}] ${noteText} (${currentTimestamp})`;

        setNotes(prevNotes => [...prevNotes, { id: Date.now(), text: noteText, timestamp: currentTimestamp, source: sourceInfo }]);
        setNewNote("");
        console.log("[handleAddNote] Optimistically added note:", fullNoteEntry);

        const updatedTaskData = {
            ...task,
            NotesContent: task.notesContent ? `${task.notesContent}\n${fullNoteEntry}` : fullNoteEntry,
        };

        setLoading(true);
        setError(null);

        try {
            console.log(`[handleAddNote] Attempting to update task ID: ${task.id} with new note in notes content.`, updatedTaskData);
            const response = await fetch(`${TASKS_API_URL}/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTaskData),
            });

            if (!response.ok) {
                let errorDetails = `Failed to add note to task notes content: ${response.status}`;
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

            console.log(`[handleAddNote] Successfully added note to task ID: ${task.id} notes content.`);
            setNoteSaveMessage("บันทึกย่อถูกเพิ่มเรียบร้อยแล้ว!");
            setNoteSaveMessageType('success');
            fetchTaskDetail();
        } catch (err) {
            console.error(`[handleAddNote] Error adding note to task ID ${task.id}:`, err);
            setNoteSaveMessage(`ไม่สามารถเพิ่มบันทึกย่อได้: ${err.message}`);
            setNoteSaveMessageType('error');
            setError(`Failed to add note: ${err.message}`);
        } finally {
            setLoading(false);
            setTimeout(() => {
                setNoteSaveMessage(null);
                setNoteSaveMessageType(null);
            }, 3000);
        }
    };

    // Function to handle editing an existing note
    const handleEditNote = (noteId, currentText) => {
        setNoteSaveMessage(null);
        setNoteSaveMessageType(null);
        setEditingNoteId(noteId);
        setEditingNoteText(currentText);
    };

    // Function to save the edited note
    const handleSaveEditedNote = async () => {
        setNoteSaveMessage(null);
        setNoteSaveMessageType(null);

        if (!editingNoteText.trim() || !task || !task.id) {
            setNoteSaveMessage("บันทึกย่อที่แก้ไขไม่สามารถว่างเปล่าได้.");
            setNoteSaveMessageType('error');
            return;
        }

        const updatedNotes = notes.map(note =>
            note.id === editingNoteId ? { ...note, text: editingNoteText.trim() } : note
        );

        try {
            await updateTaskNotes(updatedNotes);
            setNoteSaveMessage("บันทึกย่อถูกแก้ไขเรียบร้อยแล้ว!");
            setNoteSaveMessageType('success');
            setEditingNoteId(null);
            setEditingNoteText("");
        } catch (err) {
            setNoteSaveMessage(`ไม่สามารถแก้ไขบันทึกย่อได้: ${err.message}`);
            setNoteSaveMessageType('error');
        } finally {
            setTimeout(() => {
                setNoteSaveMessage(null);
                setNoteSaveMessageType(null);
            }, 3000);
        }
    };

    // Function to cancel editing
    const handleCancelEdit = () => {
        setNoteSaveMessage(null);
        setNoteSaveMessageType(null);
        setEditingNoteId(null);
        setEditingNoteText("");
    };

    // Function to confirm deletion of a specific note
    const confirmDeleteNote = (noteId) => {
        setNoteToDeleteId(noteId);
        setShowDeleteConfirmModal(true);
    };

    // Function to actually delete the note
    const handleDeleteNote = async () => {
        if (!noteToDeleteId || !task || !task.id) return;

        setShowDeleteConfirmModal(false);
        setLoading(true);
        setError(null);
        setNoteSaveMessage(null);
        setNoteSaveMessageType(null);

        const updatedNotes = notes.filter(note => note.id !== noteToDeleteId);

        try {
            await updateTaskNotes(updatedNotes);
            setNoteSaveMessage("บันทึกย่อถูกลบเรียบร้อยแล้ว!");
            setNoteSaveMessageType('success');
        } catch (err) {
            setNoteSaveMessage(`ไม่สามารถลบบันทึกย่อได้: ${err.message}`);
            setNoteSaveMessageType('error');
        } finally {
            setLoading(false);
            setNoteToDeleteId(null);
            setTimeout(() => {
                setNoteSaveMessage(null);
                setNoteSaveMessageType(null);
            }, 3000);
        }
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewAttachmentFile(file);
        } else {
            setNewAttachmentFile(null);
        }
    };

    // Function to handle adding a new attachment
    const handleAddAttachment = async () => {
        setAttachmentSaveMessage(null);
        setAttachmentSaveMessageType(null);

        if (!newAttachmentFile || !task || !task.id) {
            setAttachmentSaveMessage("กรุณาเลือกไฟล์ หรือข้อมูลงานไม่สมบูรณ์.");
            setAttachmentSaveMessageType('error');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(newAttachmentFile); // Read file as Base64

        reader.onload = async () => {
            const base64Data = reader.result; // This is the Base64 string (e.g., "data:image/png;base64,iVBORw...")
            const fileName = newAttachmentFile.name;
            const newAttachment = {
                id: Date.now(), // Unique ID for this attachment instance
                name: fileName,
                data: base64Data,
            };

            // Optimistic UI update
            setUploadedFiles(prevFiles => [...prevFiles, newAttachment]);
            setNewAttachmentFile(null); // Clear the file input
            document.getElementById('attachmentFileInput').value = ''; // Clear actual input element

            try {
                await updateTaskAttachmentsInDb([...uploadedFiles, newAttachment]);
                setAttachmentSaveMessage("ไฟล์แนบถูกเพิ่มเรียบร้อยแล้ว!");
                setAttachmentSaveMessageType('success');
            } catch (err) {
                setAttachmentSaveMessage(`ไม่สามารถเพิ่มไฟล์แนบได้: ${err.message}`);
                setAttachmentSaveMessageType('error');
            } finally {
                setTimeout(() => {
                    setAttachmentSaveMessage(null);
                    setAttachmentSaveMessageType(null);
                }, 3000);
            }
        };

        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            setAttachmentSaveMessage("เกิดข้อผิดพลาดในการอ่านไฟล์.");
            setAttachmentSaveMessageType('error');
        };
    };

    // Function to handle deleting an attachment
    const confirmDeleteAttachment = (attachmentId) => {
        setAttachmentToDeleteId(attachmentId);
        setShowDeleteConfirmModal(true);
    };

    const handleDeleteAttachment = async () => {
        if (!attachmentToDeleteId || !task || !task.id) return;

        setShowDeleteConfirmModal(false);
        setLoading(true);
        setError(null);
        setAttachmentSaveMessage(null);
        setAttachmentSaveMessageType(null);

        const updatedFiles = uploadedFiles.filter(file => file.id !== attachmentToDeleteId);

        try {
            await updateTaskAttachmentsInDb(updatedFiles);
            setAttachmentSaveMessage("ไฟล์แนบถูกลบเรียบร้อยแล้ว!");
            setAttachmentSaveMessageType('success');
        } catch (err) {
            setAttachmentSaveMessage(`ไม่สามารถลบไฟล์แนบได้: ${err.message}`);
            setAttachmentSaveMessageType('error');
        } finally {
            setLoading(false);
            setAttachmentToDeleteId(null);
            setTimeout(() => {
                setAttachmentSaveMessage(null);
                setAttachmentSaveMessageType(null);
            }, 3000);
        }
    };

    // Function to generate Google Calendar URL
    const generateGoogleCalendarUrl = (taskToGenerate) => {
        const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
        const subject = encodeURIComponent(taskToGenerate.subject || '');
        const description = encodeURIComponent(taskToGenerate.description || '');

        let dates = '';
        if (taskToGenerate.dueDate) {
            const startDate = new Date(taskToGenerate.dueDate);
            let endDate = new Date(taskToGenerate.dueDate);

            if (taskToGenerate.reminderTime) {
                const [hours, minutes] = taskToGenerate.reminderTime.split(':');
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
                return date.toISOString().replace(/[-:]|\.\d{3}/g, '');
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

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-2">กำลังโหลดรายละเอียดนัดหมาย...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <p className="text-danger mb-2">ข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
                <button className="btn btn-primary" onClick={handleGoBack}>กลับไปหน้าก่อนหน้า</button>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
                <p className="text-muted">ไม่พบข้อมูลนัดหมาย</p>
                <button className="btn btn-primary" onClick={handleGoBack}>กลับไปหน้าก่อนหน้า</button>
            </div>
        );
    }

    return (
        <div className="d-flex" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
            <CRMSidebar className="flex-shrink-0" />

            <div className="flex-grow-1 d-flex flex-column" style={{ maxHeight: "100vh" }}>
                {/* ส่วนหัว Fixed: รายละเอียดนัดคุย */}
                <div className="container-fluid py-3 px-4 flex-shrink-0" style={{ background: "#f3f7fb", zIndex: 1, borderBottom: "1px solid #e0eaff" }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="fw-bold" style={{ color: "#8a2be2" }}>
                            <ArrowLeft size={24} className="me-2 cursor-pointer" onClick={handleGoBack} />
                            📋 รายละเอียดนัดคุย
                        </h4>
                        <div className="d-flex align-items-center gap-2">
                            {/* ปุ่ม "แก้ไข" สำหรับ Task - ทำให้ใช้งานได้จริง */}
                            <button
                                className="btn btn-sm btn-outline-info rounded-3"
                                style={{ borderColor: "#b0c4de", color: "#6a5acd" }}
                                onClick={handleEditTask}
                            >
                                <Edit size={16} className="me-1" /> แก้ไข
                            </button>
                        </div>
                    </div>
                </div>

                {/* พื้นที่เนื้อหาที่เลื่อนได้ */}
                <div className="flex-grow-1 overflow-auto px-4 py-3" style={{ paddingBottom: '2rem' }}>
                    <div className="row justify-content-center">
                        <div className="col-md-12">
                            {/* ข้อมูลสรุป Task */}
                            <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                <h6 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>รายละเอียดสรุป</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">ลำดับความสำคัญ:</p>
                                        <p>{task.priority || '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">วันครบกำหนด:</p>
                                        <p>{formatDate(task.dueDate) || '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">สถานะ:</p>
                                        <p>{statusLabels[task.status] || task.status || '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">ที่เกี่ยวข้องกับ:</p>
                                        <p>{prospect ? `${prospect.prefix || ''} ${prospect.firstName || ''} ${prospect.lastName || ''} (${prospect.companyName || ''})` : '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">เจ้าของงาน:</p>
                                        <p>{task.owner || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* ข้อมูลรายละเอียด Task */}
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0 fw-bold" style={{ color: "#6a5acd" }}>ข้อมูลงาน</h6>
                                <button
                                    className="btn btn-sm btn-outline-secondary rounded-3"
                                    onClick={() => setShowTaskDetails(!showTaskDetails)}
                                >
                                    {showTaskDetails ? "ซ่อนรายละเอียด" : "แสดงรายละเอียด"}
                                    {showTaskDetails ? <ChevronUp size={16} className="ms-2" /> : <ChevronDown size={16} className="ms-2" />}
                                </button>
                            </div>
                            <div className={`card p-4 shadow-lg rounded-4 border-0 mb-4 ${showTaskDetails ? '' : 'd-none'}`} style={{ backgroundColor: "#fdfdff" }}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">เจ้าของงาน:</p>
                                        <p>{task.owner || '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">หัวเรื่อง:</p>
                                        <p>{task.subject || '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">วันครบกำหนด:</p>
                                        <p>{formatDate(task.dueDate) || '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">ลูกค้ามุ่งหวัง:</p>
                                        <p>{prospect ? `${prospect.prefix || ''} ${prospect.firstName || ''} ${prospect.lastName || ''} (Sample)` : '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">ที่เกี่ยวข้องกับ:</p>
                                        <p>{prospect ? `${prospect.prefix || ''} ${prospect.firstName || ''} ${prospect.lastName || ''}` : '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">สถานะ:</p>
                                        <p>{statusLabels[task.status] || task.status || '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">ลำดับความสำคัญ:</p>
                                        <p>{task.priority || '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">สร้างโดย:</p>
                                        <p>{task.owner || '-'} {task.createdAt ? new Date(task.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">แก้ไขโดย:</p>
                                        <p>{task.updatedBy || '-'} {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">ตัวเตือน:</p>
                                        <p>
                                            {task.reminder && task.reminderTime ?
                                                `${formatDate(task.dueDate)} ${formatTimeSpan(task.reminderTime)} (${task.reminderMethod})`
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">ทำซ้ำ:</p>
                                        <p>{task.repeat !== 'None' ? task.repeat : '-'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="form-label mb-1 fw-bold">เวลาเข้าชม:</p>
                                        <p>-</p> {/* Placeholder, assuming no direct view time in task object */}
                                    </div>
                                    {/* ข้อมูลคำอธิบาย Task - ย้ายมาที่นี่ */}
                                    <div className="col-md-12">
                                        <p className="form-label mb-1 fw-bold">คำอธิบาย:</p>
                                        <p>{task.description || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* ส่วนปุ่มการกระทำ */}
                            <div className="col-md-12 mb-4">
                                <div className="d-flex justify-content-end gap-2">
                                    {/* ปุ่ม "เพิ่มในปฏิทิน" */}
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        style={{ borderColor: "#b0c4de", color: "#6a5acd" }}
                                        onClick={() => window.open(generateGoogleCalendarUrl(task), '_blank')}
                                    >
                                        เพิ่มในปฏิทิน
                                    </button>
                                    {/* ปุ่ม "ยืนยันการแจ้งเตือน" */}
                                    {!task.isNotified && (
                                        <button
                                            className="btn btn-sm btn-outline-warning"
                                            style={{ borderColor: "#ffc107", color: "#ffc107" }}
                                            onClick={confirmNotification}
                                        >
                                            ยืนยันการแจ้งเตือน
                                        </button>
                                    )}
                                    {task.isNotified && (
                                        <span className="badge bg-success" style={{ fontSize: '0.8em', padding: '0.5em 0.8em', alignSelf: 'center' }}>แจ้งเตือนแล้ว</span>
                                    )}
                                    {/* ปุ่ม "ปิดงาน" */}
                                    {task.status !== 'Completed' && (
                                        <button
                                            className="btn btn-sm btn-outline-success"
                                            style={{ borderColor: "#28a745", color: "#28a745" }}
                                            onClick={confirmCloseTask}
                                        >
                                            ปิดงาน
                                        </button>
                                    )}
                                    {/* ปุ่ม "ลบ" */}
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        style={{ borderColor: "#dc3545", color: "#dc3545" }}
                                        onClick={confirmDeleteTask}
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </div>

                            {/* ส่วนบันทึกย่อ */}
                            <div className="col-md-12">
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h6 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>บันทึกย่อ</h6>
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
                                    {notes.length === 0 ? (
                                        <p className="text-muted">ยังไม่มีบันทึกย่อ</p>
                                    ) : (
                                        <ul className="list-group list-group-flush">
                                            {notes.map((note, index) => (
                                                <li key={note.id || index} className="list-group-item d-flex justify-content-between align-items-center">
                                                    {editingNoteId === note.id ? (
                                                        // Editing mode
                                                        <div className="d-flex w-100 align-items-center">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm me-2"
                                                                value={editingNoteText}
                                                                onChange={(e) => setEditingNoteText(e.target.value)}
                                                                onKeyPress={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleSaveEditedNote();
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                className="btn btn-sm btn-success me-1"
                                                                onClick={handleSaveEditedNote}
                                                            >
                                                                บันทึก
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-secondary"
                                                                onClick={handleCancelEdit}
                                                            >
                                                                ยกเลิก
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        // Display mode
                                                        <div className="d-flex w-100 justify-content-between align-items-center">
                                                            <div>
                                                                {/* Display source if available */}
                                                                {note.source && <span className="fw-bold me-1" style={{ color: "#6a5acd" }}>[{note.source}]</span>}
                                                                {note.text}
                                                                <small className="text-muted ms-2">({note.timestamp})</small>
                                                            </div>
                                                            <div>
                                                                <button
                                                                    className="btn btn-sm btn-outline-info me-1"
                                                                    style={{ borderColor: "#b0c4de", color: "#6a5acd" }}
                                                                    onClick={() => handleEditNote(note.id, note.text)}
                                                                >
                                                                    แก้ไข
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    style={{ borderColor: "#dc3545", color: "#dc3545" }}
                                                                    onClick={() => confirmDeleteNote(note.id)}
                                                                >
                                                                    ลบ
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* ส่วนสิ่งที่แนบมา */}
                            <div className="col-md-12">
                                <div className="card p-4 shadow-lg rounded-4 border-0 mb-4" style={{ backgroundColor: "#fdfdff" }}>
                                    <h6 className="fw-bold mb-3" style={{ color: "#6a5acd" }}>สิ่งที่แนบมา</h6>
                                    {/* Warning about Base64 storage */}
                                    <div className="alert alert-warning small" role="alert">
                                        <Info size={16} className="me-2" />
                                        **ข้อควรทราบ:** ไฟล์จะถูกแปลงเป็น Base64 และจัดเก็บในฐานข้อมูลโดยตรง ซึ่งไม่เหมาะสำหรับไฟล์ขนาดใหญ่มาก. ในการใช้งานจริง ควรใช้บริการ Cloud Storage สำหรับการจัดเก็บไฟล์.
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <input
                                            type="file"
                                            id="attachmentFileInput" // Add an ID to clear the input
                                            className="form-control rounded-3"
                                            onChange={handleFileChange}
                                            style={{ borderColor: "#c2e9fb" }}
                                        />
                                        <button
                                            className="btn btn-primary ms-2 rounded-3"
                                            style={{ background: "linear-gradient(45deg, #a1c4fd, #c2e9fb)", borderColor: "#a1c4fd", color: "#36454F" }}
                                            onClick={handleAddAttachment}
                                            disabled={!newAttachmentFile} // Disable if no file is selected
                                        >
                                            <Paperclip size={16} className="me-1" /> อัปโหลด
                                        </button>
                                    </div>
                                    {/* Message display for attachments */}
                                    {attachmentSaveMessage && (
                                        <div className={`alert ${attachmentSaveMessageType === 'success' ? 'alert-success' : 'alert-danger'} mt-3 mb-3`} role="alert">
                                            {attachmentSaveMessage}
                                        </div>
                                    )}
                                    {uploadedFiles.length === 0 ? (
                                        <p className="text-muted">ยังไม่มีไฟล์แนบ</p>
                                    ) : (
                                        <ul className="list-group list-group-flush">
                                            {uploadedFiles.map((file, index) => (
                                                <li key={file.id || index} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <Paperclip size={16} className="me-2 text-orange-500" />
                                                        {file.name}
                                                    </div>
                                                    <div>
                                                        {file.data && ( // Only show download if data exists
                                                            <a
                                                                href={file.data}
                                                                download={file.name}
                                                                className="btn btn-sm btn-outline-primary me-1 rounded-3"
                                                                style={{ borderColor: "#a1c4fd", color: "#6a5acd" }}
                                                            >
                                                                <Download size={16} className="me-1" /> ดาวน์โหลด
                                                            </a>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-outline-danger rounded-3"
                                                            style={{ borderColor: "#dc3545", color: "#dc3545" }}
                                                            onClick={() => confirmDeleteAttachment(file.id)}
                                                        >
                                                            ลบ
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* ปุ่ม "ย้อนกลับ" ที่ด้านล่าง */}
                <div className="flex-shrink-0 px-4 py-3" style={{ background: "#f3f7fb", borderTop: "1px solid #e0eaff" }}>
                    <button className="btn btn-secondary rounded-3" onClick={handleGoBack}>
                        ย้อนกลับ
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal (Reused for task deletion and note/attachment deletion) */}
            <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>ยืนยันการลบ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    คุณแน่ใจหรือไม่ว่าต้องการลบ
                    {noteToDeleteId ? "บันทึกย่อนี้" : attachmentToDeleteId ? "ไฟล์แนบนี้" : "งานนี้"}
                    ? การดำเนินการนี้ไม่สามารถย้อนกลับได้.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowDeleteConfirmModal(false);
                        setNoteToDeleteId(null);
                        setAttachmentToDeleteId(null);
                    }}>
                        ยกเลิก
                    </Button>
                    <Button variant="danger" onClick={
                        noteToDeleteId ? handleDeleteNote :
                        attachmentToDeleteId ? handleDeleteAttachment :
                        handleDeleteTask
                    }>
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

            {/* Confirm Notification Modal */}
            <Modal show={showConfirmNotificationModal} onHide={() => setShowConfirmNotificationModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>ยืนยันการแจ้งเตือน</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    คุณแน่ใจหรือไม่ว่างานนี้ได้รับการแจ้งเตือนแล้ว?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmNotificationModal(false)}>
                        ยกเลิก
                    </Button>
                    <Button variant="warning" onClick={handleConfirmNotification}>
                        ยืนยัน
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
