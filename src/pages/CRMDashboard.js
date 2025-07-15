import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { Calendar, Clipboard, User, Bell, CheckSquare, Info, Clock } from 'lucide-react'; // Import Lucide Icons for better visuals

export default function CRMDashboard() {
  const navigate = useNavigate(); // Initialize useNavigate

  const statBoxStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    minHeight: "100px",
    textAlign: "center",
  };

  const emptyCardStyle = {
    background: "#f9f9fc",
    borderRadius: "12px",
    padding: "40px",
    minHeight: "250px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#888",
    border: "2px dashed #ddd",
  };

  // State for tasks
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  // State for prospects (to get contact names for tasks)
  const [prospects, setProspects] = useState([]);
  const [loadingProspects, setLoadingProspects] = useState(true);
  const [prospectsError, setProspectsError] = useState(null);

  const TASKS_API_URL = "https://localhost:7274/api/tasks";
  const PROSPECTS_API_URL = "https://localhost:7274/api/leads"; // API for prospects

  // Mapping of internal status values to display labels (Thai) - copied from CRMProspectDetail
  const statusLabels = {
    Open: "เปิด",
    NotStarted: "ไม่ได้เริ่ม",
    Postponed: "เลื่อนเวลา",
    InProgress: "กำลังคืบหน้า",
    Completed: "เสร็จสมบูรณ์",
    WaitingInput: "รอข้อมูลอินพุต",
    Closed: "ปิดแล้ว"
  };

  // Helper function to format date
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

  // Helper function to check if a task is overdue
  const isOverdue = (dueDate, reminderTime) => {
    if (!dueDate) return false;

    const now = new Date();
    const dueDateTime = new Date(dueDate);

    // If reminderTime is provided, use it for precise comparison
    if (reminderTime) {
      const [hours, minutes] = reminderTime.split(':');
      dueDateTime.setHours(parseInt(hours, 10));
      dueDateTime.setMinutes(parseInt(minutes, 10));
      dueDateTime.setSeconds(0);
      dueDateTime.setMilliseconds(0);
    } else {
      // If no reminderTime, consider the end of the due date as the deadline
      dueDateTime.setHours(23);
      dueDateTime.setMinutes(59);
      dueDateTime.setSeconds(59);
      dueDateTime.setMilliseconds(999);
    }

    return dueDateTime < now;
  };

  // Helper function to get days until due (for upcoming tasks)
  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate day comparison

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0); // Reset time to start of day

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Round up to count partial days

    return diffDays;
  };

  // Function to fetch all tasks
  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    setTasksError(null);
    try {
      const response = await fetch(TASKS_API_URL);
      if (!response.ok) {
        let errorDetails = `Failed to fetch tasks: ${response.status}`;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          try {
            const errorData = await response.json();
            errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
          } catch (jsonError) {
            errorDetails = `Failed to parse JSON error response: ${jsonError.message}`;
            console.error("[CRMDashboard] Failed to parse JSON error response (tasks):", jsonError);
          }
        } else {
          errorDetails = await response.text();
          console.error("[CRMDashboard] Non-JSON error response (tasks):", errorDetails);
        }
        throw new Error(errorDetails);
      }
      const data = await response.json();
      setTasks(data);
      console.log("[CRMDashboard] Fetched tasks:", data); // Log fetched tasks
    } catch (err) {
      console.error("[CRMDashboard] Error fetching tasks:", err);
      setTasksError(err.message);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // Function to fetch all prospects
  const fetchProspects = useCallback(async () => {
    setLoadingProspects(true);
    setProspectsError(null);
    try {
      const response = await fetch(PROSPECTS_API_URL);
      if (!response.ok) {
        let errorDetails = `Failed to fetch prospects: ${response.status}`;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          try {
            const errorData = await response.json();
            errorDetails = errorData.detail || errorData.title || errorData.message || `HTTP error! status: ${response.status}`;
          } catch (jsonError) {
            errorDetails = `Failed to parse JSON error response (prospects): ${jsonError.message}`;
            console.error("[CRMDashboard] Failed to parse JSON error response (prospects):", jsonError);
          }
        } else {
          errorDetails = await response.text();
          console.error("[CRMDashboard] Non-JSON error response (prospects):", errorDetails);
        }
        throw new Error(errorDetails);
      }
      const data = await response.json();
      setProspects(data);
      console.log("[CRMDashboard] Fetched prospects:", data); // Log fetched prospects
    } catch (err) {
      console.error("[CRMDashboard] Error fetching prospects:", err);
      setProspectsError(err.message);
    } finally {
      setLoadingProspects(false);
    }
  }, []);

  // Fetch tasks and prospects on component mount
  useEffect(() => {
    fetchTasks();
    fetchProspects();
  }, [fetchTasks, fetchProspects]);

  // Filter for open tasks (excluding 'Completed' status)
  const openTasks = tasks.filter(task => task.status !== 'Completed');

  // Function to handle navigation to appointment detail page
  const handleViewTaskDetail = (taskId) => {
    navigate(`/crm-appointment-detail/${taskId}`); // Navigate to new AppointmentDetail page using taskId
  };

  // Determine overall loading and error states
  const overallLoading = loadingTasks || loadingProspects;
  const overallError = tasksError || prospectsError;

  if (overallLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-2">กำลังโหลดข้อมูลแดชบอร์ด...</p>
      </div>
    );
  }

  if (overallError) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: "100vh", background: "#f3f7fb" }}>
        <p className="text-danger mb-2">ข้อผิดพลาดในการโหลดข้อมูล: {overallError}</p>
        <button className="btn btn-primary" onClick={() => { fetchTasks(); fetchProspects(); }}>ลองใหม่</button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ width: "100%" }}>
      <h4 className="fw-bold mb-4" style={{ color: "#8a2be2" }}>📊 CRM Dashboard</h4>

      {/* Top Summary Row */}
      <div className="row g-4 mb-4">
        {[
          { label: "ข้อเสนอ ที่เปิดอยู่ของฉัน", value: 0 },
          { label: "ข้อเสนอ ที่ยังไม่ได้ติดต่อของฉัน", value: 0 },
          { label: "การโทร วันนี้ของฉัน", value: 0 },
          { label: "ลูกค้ามุ่งหวัง ของฉัน", value: 0 },
        ].map((item, idx) => (
          <div className="col-md-3" key={idx}>
            <div style={statBoxStyle}>
              <div className="text-muted small mb-1">{item.label}</div>
              <div className="fs-3 fw-bold">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section: งาน + การประชุม */}
      <div className="row g-4">
        <div className="col-md-6">
          <h6 className="mb-2">🗂️ งาน ที่เปิดอยู่ของฉัน</h6>
          <div className="card shadow-lg rounded-4 border-0 p-3" style={{ backgroundColor: "#fdfdff", minHeight: "250px" }}>
            {loadingTasks && (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-2">กำลังโหลดงาน...</p>
              </div>
            )}
            {tasksError && (
              <div className="d-flex justify-content-center align-items-center h-100">
                <p className="text-danger">ข้อผิดพลาดในการโหลดงาน: {tasksError}</p>
              </div>
            )}
            {!loadingTasks && !tasksError && openTasks.length === 0 && (
              <div style={emptyCardStyle}>
                <div>
                  <i className="bi bi-table" style={{ fontSize: "2rem", opacity: 0.2 }}></i>
                  <div className="mt-2">ไม่พบ งาน</div>
                </div>
              </div>
            )}
            {!loadingTasks && !tasksError && openTasks.length > 0 && (
              <div className="list-group list-group-flush">
                {openTasks.map(task => {
                  // Find the related prospect to get the contact name
                  const relatedProspect = prospects.find(p => p.leadID === parseInt(task.leadId)); 
                  const contactName = relatedProspect ? 
                                      `${relatedProspect.prefix || ''} ${relatedProspect.firstName || ''} ${relatedProspect.lastName || ''}`.trim() : 
                                      'ไม่ระบุผู้ติดต่อ'; 
                  
                  // Check if the task is overdue
                  const isTaskOverdue = isOverdue(task.dueDate, task.reminderTime);
                  // Get days until due for upcoming tasks
                  const daysUntilDue = isTaskOverdue ? null : getDaysUntilDue(task.dueDate); // Only calculate if not overdue

                  // Determine status badge color
                  let statusBadgeColor = 'bg-secondary';
                  if (task.status === 'Open' || task.status === 'InProgress') {
                    statusBadgeColor = 'bg-primary';
                  } else if (task.status === 'WaitingInput' || task.status === 'Postponed') {
                    statusBadgeColor = 'bg-info text-dark';
                  } else if (task.status === 'NotStarted') {
                    statusBadgeColor = 'bg-warning text-dark';
                  } else if (task.status === 'Completed' || task.status === 'Closed') {
                    statusBadgeColor = 'bg-success'; // Should not appear in open tasks, but for completeness
                  }

                  return (
                    <div 
                      key={task.id} 
                      className="list-group-item list-group-item-action rounded-3 mb-2 shadow-sm"
                      style={{ 
                        cursor: 'pointer',
                        borderColor: isTaskOverdue ? '#dc3545' : "#e0eaff", // Red border if overdue
                        backgroundColor: isTaskOverdue ? '#fff3f3' : "#fcfdff", // Light red background if overdue
                        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
                      }}
                      onClick={() => handleViewTaskDetail(task.id)} // Navigate to new AppointmentDetail page using task.id
                    >
                      <div className="d-flex w-100 justify-content-between align-items-start">
                        <h6 className="mb-1 fw-bold flex-grow-1" style={{ color: "#4a4a4a" }}>
                          <Clipboard size={16} className="me-2 text-blue-500" />
                          {task.subject}
                        </h6>
                        <span className={`badge ${task.priority === 'สูง' ? 'bg-danger' : task.priority === 'ปานกลาง' ? 'bg-warning text-dark' : 'bg-success'} ms-2`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="d-flex flex-column align-items-start mt-2">
                        <small className="text-muted mb-1 d-flex align-items-center">
                          <Calendar size={14} className="me-1 text-red-500" />
                          วันครบกำหนด: {formatDate(task.dueDate)}
                          {isTaskOverdue && (
                            <span className="badge bg-danger ms-2 d-flex align-items-center">
                              <Clock size={12} className="me-1" /> เลยกำหนด!
                            </span>
                          )}
                          {!isTaskOverdue && daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 2 && (
                            <span className="badge bg-info text-dark ms-2 d-flex align-items-center">
                              <Clock size={12} className="me-1" /> ถึงกำหนดในอีก {daysUntilDue} วัน
                            </span>
                          )}
                        </small>
                        <small className="text-muted mb-1 d-flex align-items-center">
                          <CheckSquare size={14} className={`me-1 ${statusBadgeColor.includes('primary') ? 'text-blue-500' : statusBadgeColor.includes('info') ? 'text-cyan-500' : statusBadgeColor.includes('warning') ? 'text-yellow-500' : 'text-gray-500'}`} />
                          สถานะ: <span className={`badge ${statusBadgeColor} ms-1`}>{statusLabels[task.status] || task.status}</span>
                        </small>
                        <small className="text-muted d-flex align-items-center">
                          <User size={14} className="me-1 text-green-500" />
                          ผู้ติดต่อ: {contactName}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <h6 className="mb-2">🗓️ การประชุม ของฉัน</h6>
          <div style={emptyCardStyle}>
            <div>
              <i className="bi bi-calendar-event" style={{ fontSize: "2rem", opacity: 0.2 }}></i>
              <div className="mt-2">ไม่พบ การประชุม</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
