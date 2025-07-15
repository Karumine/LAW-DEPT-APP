import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Dropdown } from 'react-bootstrap';
import { Calendar, Clipboard, User, Bell, Repeat, Clock, Info, Paperclip, CheckSquare } from 'lucide-react'; // Import new Lucide Icons

// This component represents the "Create Task" form as a modal.
// It receives 'show' to control visibility, 'onHide' to close itself,
// and 'leadId' for data association.
const CreateTaskModal = ({ show, onHide, leadId }) => {
    // Debugging: Log the leadId received by the modal immediately when the component renders
    console.log('CreateTaskModal (render) received leadId:', leadId);

    // Debugging: Log the leadId received by the modal whenever it changes
    // This helps confirm that the leadId is correctly passed from the parent component.
    useEffect(() => {
        console.log('CreateTaskModal (useEffect) leadId changed to:', leadId);
    }, [leadId]);

    // State to manage form data
    const [formData, setFormData] = useState({
        Subject: '', // Matches database column name
        DueDate: '',
        Priority: 'สูง',
        Owner: 'Supap Nonkaew',
        Reminder: false, // Boolean
        ReminderTime: '', // Time string for input
        ReminderMethod: '', // String
        Repeat: 'None', // Default 'None' for dropdown, matches database VARCHAR
        // *** เพิ่ม fields ใหม่ตามที่ร้องขอ ***
        Status: 'Open', // Default status for new tasks (internal value)
        Description: '',
        Attachments: '',
        // ClosedAt is handled by backend, not set directly in frontend form
    });

    // State to control visibility of "More Fields" section
    const [showMoreFields, setShowMoreFields] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // API endpoint for saving tasks (adjust this to your C#.NET API)
    const TASKS_API_URL = "https://localhost:7274/api/tasks";

    // Effect to reset form data and messages when the modal is shown
    useEffect(() => {
        if (show) {
            // Reset form data and messages when modal opens
            setFormData({
                Subject: '',
                DueDate: '',
                Priority: 'สูง',
                Owner: 'Supap Nonkaew',
                Reminder: false,
                ReminderTime: '',
                ReminderMethod: '',
                Repeat: 'None',
                Status: 'Open', // Reset to default for new task
                Description: '',
                Attachments: '',
            });
            setShowMoreFields(false); // Hide more fields on modal open
            setSaveError(null);
            setSaveSuccess(false);
        }
    }, [show]);

    // Handle input changes for form fields
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        // Debugging: Log the leadId at the moment of submission
        console.log('Attempting to save task with leadId (inside handleSubmit):', leadId);

        // Client-side validation: Check if leadId is missing or empty
        if (!leadId || String(leadId).trim() === '' || parseInt(leadId) === 0) { // Added check for 0
            setSaveError("Lead ID ไม่ถูกต้องหรือไม่พบ. ไม่สามารถบันทึกงานได้.");
            setIsSaving(false);
            return;
        }

        // Client-side validation: Check if Subject field is empty
        if (!formData.Subject.trim()) {
            setSaveError("หัวข้อ (Subject) ของงานจำเป็นต้องกรอก.");
            setIsSaving(false);
            return;
        }

        // Client-side validation for Reminder fields if Reminder is true
        if (formData.Reminder) {
            if (!formData.ReminderTime) {
                setSaveError("ถ้าเปิดใช้งานตัวเตือน ต้องระบุเวลาแจ้งเตือน.");
                setIsSaving(false);
                return;
            }
            if (!formData.ReminderMethod.trim()) {
                setSaveError("ถ้าเปิดใช้งานตัวเตือน ต้องระบุวิธีแจ้งเตือน.");
                setIsSaving(false);
                return;
            }
        }

        try {
            // Prepare task data to send to C#.NET backend
            const taskData = {
                // Ensure field names match your C#.NET backend model (PascalCase for C# properties)
                Subject: formData.Subject,
                DueDate: formData.DueDate || null, // Send null if empty, as DueDate is nullable
                Priority: formData.Priority,
                Owner: formData.Owner,
                Reminder: formData.Reminder, // Send as boolean
                ReminderTime: formData.Reminder ? formData.ReminderTime : null, // Send null if reminder is off
                ReminderMethod: formData.Reminder ? formData.ReminderMethod : null, // Send null if reminder is off
                Repeat: formData.Repeat === "None" ? "" : formData.Repeat, // Send empty string for "None"
                LeadId: parseInt(leadId), // Ensure LeadId is an integer
                // *** เพิ่ม fields ใหม่ที่ส่งไป Backend ***
                Status: formData.Status, // Send the internal English value
                Description: formData.Description || null, // Send null if empty
                Attachments: formData.Attachments || null, // Send null if empty
                // ClosedAt is handled by backend, so we don't send it from here on create
            };

            console.log("Sending taskData:", taskData); // Log the data being sent

            const response = await fetch(TASKS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any authorization headers if your C#.NET API requires them
                    // 'Authorization': `Bearer ${yourAuthToken}`
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                const errorText = await response.text(); // Get raw error text
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.errors) {
                        // Attempt to parse specific validation errors
                        const validationMessages = Object.values(errorJson.errors).flat().join('; ');
                        errorMessage += `, validation errors: ${validationMessages}`;
                    } else if (errorJson.title) {
                        errorMessage += `, message: ${errorJson.title}`;
                    } else {
                        errorMessage += `, raw message: ${errorText}`;
                    }
                } catch (parseError) {
                    errorMessage += `, raw message: ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            setSaveSuccess(true);
            console.log("Task Data Submitted and Saved to C#.NET Backend:", taskData);

            // Optionally, reset form after successful save
            setFormData({
                Subject: '',
                DueDate: '',
                Priority: 'สูง',
                Owner: 'Supap Nonkaew',
                Reminder: false,
                ReminderTime: '',
                ReminderMethod: '',
                Repeat: 'None',
                Status: 'Open', // Reset to default
                Description: '',
                Attachments: '',
            });
            setShowMoreFields(false); // Hide more fields after successful save
            // Close the modal after a short delay to allow success message to be seen
            setTimeout(() => {
                onHide();
            }, 1500);

        } catch (err) {
            console.error("Error saving task to C#.NET Backend:", err);
            setSaveError("Failed to save task: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle owner selection from dropdown
    const handleOwnerSelect = (owner) => {
        setFormData(prevData => ({
            ...prevData,
            Owner: owner // Update Owner (PascalCase)
        }));
    };

    // Handle priority selection from dropdown
    const handlePrioritySelect = (priority) => {
        setFormData(prevData => ({
            ...prevData,
            Priority: priority // Update Priority (PascalCase)
        }));
    };

    // Handle repeat selection from dropdown
    const handleRepeatSelect = (repeatType) => {
        setFormData(prevData => ({
            ...prevData,
            Repeat: repeatType // Update Repeat (PascalCase)
        }));
    };

    // Handle status selection from dropdown
    const handleStatusSelect = (status) => {
        setFormData(prevData => ({
            ...prevData,
            Status: status // Update Status (PascalCase) - store the internal English value
        }));
    };

    // Mapping of internal status values to display labels (Thai)
    const statusLabels = {
        Open: "เปิด", // Added translation for 'Open'
        NotStarted: "ไม่ได้เริ่ม",
        Postponed: "เลื่อนเวลา",
        InProgress: "กำลังคืบหน้า",
        Completed: "เสร็จสมบูรณ์",
        WaitingInput: "รอข้อมูลอินพุต"
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-b-0">
                <Modal.Title className="font-bold text-purple-700">
                    สร้าง งาน {leadId ? `สำหรับ Lead ID: ${leadId}` : '(Lead ID ไม่พบ)'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-6">
                <Form onSubmit={handleSubmit} id="createTaskForm">
                    {/* Subject Field */}
                    <Form.Group className="mb-4" controlId="formSubject">
                        <Form.Label className="font-bold text-gray-700 flex items-center">
                            <Clipboard size={16} className="mr-2 text-blue-500" />หัวเรื่อง
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="Subject" // Matches database column name
                            value={formData.Subject}
                            onChange={handleChange}
                            placeholder="กรอกหัวเรื่อง"
                            required
                            className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                    </Form.Group>

                    {/* Due Date Field */}
                    <Form.Group className="mb-4" controlId="formDueDate">
                        <Form.Label className="font-bold text-gray-700 flex items-center">
                            <Calendar size={16} className="mr-2 text-red-500" />วันครบกำหนด
                        </Form.Label>
                        <Form.Control
                            type="date"
                            name="DueDate" // Matches database column name
                            value={formData.DueDate}
                            onChange={handleChange}
                            className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                    </Form.Group>

                    {/* Priority Field */}
                    <Form.Group className="mb-4" controlId="formPriority">
                        <Form.Label className="font-bold text-gray-700">ลำดับความสำคัญ</Form.Label>
                        <Dropdown onSelect={handlePrioritySelect} className="w-full">
                            <Dropdown.Toggle
                                variant="outline-secondary"
                                id="dropdown-priority"
                                className="w-full text-left rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            >
                                {formData.Priority}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="rounded-lg shadow-lg w-full">
                                <Dropdown.Item eventKey="สูง" className="hover:bg-blue-100">สูง</Dropdown.Item>
                                <Dropdown.Item eventKey="ปานกลาง" className="hover:bg-blue-100">ปานกลาง</Dropdown.Item>
                                <Dropdown.Item eventKey="ต่ำ" className="hover:bg-blue-100">ต่ำ</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Form.Group>

                    {/* Owner Field */}
                    <Form.Group className="mb-4" controlId="formOwner">
                        <Form.Label className="font-bold text-gray-700 flex items-center">
                            <User size={16} className="mr-2 text-green-500" />เจ้าของ
                        </Form.Label>
                        <Dropdown onSelect={handleOwnerSelect} className="w-full">
                            <Dropdown.Toggle
                                variant="outline-secondary"
                                id="dropdown-owner"
                                className="w-full text-left rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            >
                                {formData.Owner}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="rounded-lg shadow-lg w-full">
                                <Dropdown.Item eventKey="Supap Nonkaew" className="hover:bg-blue-100">Supap Nonkaew</Dropdown.Item>
                                {/* Add more owners here if needed */}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Form.Group>

                    {/* Reminder Toggle */}
                    <Form.Group className="mb-4 flex items-center justify-between" controlId="formReminder">
                        <Form.Label className="mb-0 font-bold text-gray-700 flex items-center">
                            <Bell size={16} className="mr-2 text-yellow-500" />ตัวเตือน
                        </Form.Label>
                        <Form.Check
                            type="switch"
                            id="reminder-switch"
                            name="Reminder" // Matches database column name
                            checked={formData.Reminder}
                            onChange={handleChange}
                            className="custom-switch"
                        />
                    </Form.Group>

                    {/* Reminder Time and Method (conditionally rendered) */}
                    {formData.Reminder && (
                        <>
                            <Form.Group className="mb-4" controlId="formReminderTime">
                                <Form.Label className="font-bold text-gray-700 flex items-center">
                                    <Clock size={16} className="mr-2 text-gray-500" />เวลาแจ้งเตือน
                                </Form.Label>
                                <Form.Control
                                    type="time"
                                    name="ReminderTime" // Matches database column name
                                    value={formData.ReminderTime}
                                    onChange={handleChange}
                                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    required={formData.Reminder}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="formReminderMethod">
                                <Form.Label className="font-bold text-gray-700">วิธีแจ้งเตือน</Form.Label>
                                <Dropdown onSelect={(method) => setFormData(prev => ({ ...prev, ReminderMethod: method }))} className="w-full">
                                    <Dropdown.Toggle
                                        variant="outline-secondary"
                                        id="dropdown-reminder-method"
                                        className="w-full text-left rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    >
                                        {formData.ReminderMethod || "เลือกวิธีแจ้งเตือน"}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="rounded-lg shadow-lg w-full">
                                        <Dropdown.Item eventKey="Email" className="hover:bg-blue-100">อีเมล</Dropdown.Item>
                                        <Dropdown.Item eventKey="SMS" className="hover:bg-blue-100">SMS</Dropdown.Item>
                                        <Dropdown.Item eventKey="In-App" className="hover:bg-blue-100">ในแอป</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Form.Group>
                        </>
                    )}

                    {/* Repeat Type Dropdown */}
                    <Form.Group className="mb-4" controlId="formRepeat">
                        <Form.Label className="mb-0 font-bold text-gray-700 flex items-center">
                            <Repeat size={16} className="mr-2 text-purple-500" />ทำซ้ำ
                        </Form.Label>
                        <Dropdown onSelect={handleRepeatSelect} className="w-full">
                            <Dropdown.Toggle
                                variant="outline-secondary"
                                id="dropdown-repeat"
                                className="w-full text-left rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            >
                                {formData.Repeat === "None" ? "ไม่มี" : formData.Repeat}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="rounded-lg shadow-lg w-full">
                                <Dropdown.Item eventKey="None" className="hover:bg-blue-100">ไม่มี</Dropdown.Item>
                                <Dropdown.Item eventKey="Daily" className="hover:bg-blue-100">รายวัน</Dropdown.Item>
                                <Dropdown.Item eventKey="Weekly" className="hover:bg-blue-100">รายสัปดาห์</Dropdown.Item>
                                <Dropdown.Item eventKey="Monthly" className="hover:bg-blue-100">รายเดือน</Dropdown.Item>
                                <Dropdown.Item eventKey="Yearly" className="hover:bg-blue-100">รายปี</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Form.Group>

                    {/* More Fields Button */}
                    <div className="mb-4 text-right">
                        <button
                            type="button"
                            className="btn btn-link text-decoration-none text-blue-600 hover:underline p-0"
                            onClick={() => setShowMoreFields(!showMoreFields)}
                        >
                            {showMoreFields ? "ซ่อนเขตข้อมูลเพิ่มเติม" : "แสดงเขตข้อมูลเพิ่มเติม"}
                        </button>
                    </div>

                    {/* Conditional More Fields Section */}
                    {showMoreFields && (
                        <div className="more-fields-section">
                            {/* Status Field */}
                            <Form.Group className="mb-4" controlId="formStatus">
                                <Form.Label className="font-bold text-gray-700 flex items-center">
                                    <CheckSquare size={16} className="mr-2 text-blue-500" />สถานะ
                                </Form.Label>
                                <Dropdown onSelect={handleStatusSelect} className="w-full">
                                    <Dropdown.Toggle
                                        variant="outline-secondary"
                                        id="dropdown-status"
                                        className="w-full text-left rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    >
                                        {statusLabels[formData.Status] || "เลือกสถานะ"} {/* Display Thai label */}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="rounded-lg shadow-lg w-full">
                                        {/* Dropdown items use the internal English value for eventKey */}
                                        <Dropdown.Item eventKey="Open" className="hover:bg-blue-100">เปิด</Dropdown.Item>
                                        <Dropdown.Item eventKey="NotStarted" className="hover:bg-blue-100">ไม่ได้เริ่ม</Dropdown.Item>
                                        <Dropdown.Item eventKey="Postponed" className="hover:bg-blue-100">เลื่อนเวลา</Dropdown.Item>
                                        <Dropdown.Item eventKey="InProgress" className="hover:bg-blue-100">กำลังคืบหน้า</Dropdown.Item>
                                        <Dropdown.Item eventKey="Completed" className="hover:bg-blue-100">เสร็จสมบูรณ์</Dropdown.Item>
                                        <Dropdown.Item eventKey="WaitingInput" className="hover:bg-blue-100">รอข้อมูลอินพุต</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Form.Group>

                            {/* Description Field */}
                            <Form.Group className="mb-4" controlId="formDescription">
                                <Form.Label className="font-bold text-gray-700 flex items-center">
                                    <Info size={16} className="mr-2 text-purple-500" />คำอธิบาย
                                </Form.Label>
                                <Form.Control
                                    as="textarea" // Use textarea for multi-line input
                                    rows={3}
                                    name="Description" // Matches database column name
                                    value={formData.Description}
                                    onChange={handleChange}
                                    placeholder="เพิ่มคำอธิบายเพิ่มเติม..."
                                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                />
                            </Form.Group>

                            {/* Attachments Field */}
                            <Form.Group className="mb-4" controlId="formAttachments">
                                <Form.Label className="font-bold text-gray-700 flex items-center">
                                    <Paperclip size={16} className="mr-2 text-orange-500" />สิ่งที่แนบมา
                                </Form.Label>
                                <Form.Control
                                    type="text" // For simplicity, a text input for URLs/paths
                                    name="Attachments" // Matches database column name
                                    value={formData.Attachments}
                                    onChange={handleChange}
                                    placeholder="เพิ่ม URL ไฟล์ หรือชื่อไฟล์ (คั่นด้วยจุลภาค)"
                                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                />
                            </Form.Group>

                            {/* NOTE: ClosedAt is NOT included here as it's set by the backend */}
                        </div>
                    )}

                    {/* Saving status and messages */}
                    {isSaving && (
                        <div className="flex items-center justify-center mt-4 text-blue-500">
                            <div className="spinner-border spinner-border-sm mr-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            กำลังบันทึก...
                        </div>
                    )}
                    {saveError && (
                        <div className="mt-4 text-red-600 text-center">
                            <p>เกิดข้อผิดพลาด: {saveError}</p>
                        </div>
                    )}
                    {saveSuccess && (
                        <div className="mt-4 text-green-600 text-center">
                            <p>บันทึกงานสำเร็จ!</p>
                        </div>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-t-0 pt-0 flex justify-end gap-2">
                <Button
                    variant="secondary"
                    onClick={onHide}
                    className="rounded-lg px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300 shadow-sm"
                    disabled={isSaving}
                >
                    ยกเลิก
                </Button>
                <Button
                    type="submit" // This button will trigger the form's onSubmit
                    form="createTaskForm" // Associate button with the form using its ID
                    className="rounded-lg px-4 py-2 text-white bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 shadow-md"
                    disabled={isSaving}
                >
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateTaskModal;
