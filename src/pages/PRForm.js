import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar"; // Import the new Sidebar component

export default function PRFormPage() { // Renamed from App to PRFormPage
  const formRef = useRef();
  const [previewImage, setPreviewImage] = useState(null);
  const [jsPDF, setJsPDF] = useState(null);
  const [html2canvasLib, setHtml2canvasLib] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load jsPDF and html2canvas from CDN
  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Load jsPDF library
        if (!window.jspdf) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
            script.onload = () => {
              console.log("jsPDF script loaded. window.jspdf:", window.jspdf);
              if (window.jspdf && typeof window.jspdf.jsPDF === 'function') {
                setJsPDF(() => window.jspdf.jsPDF); // Set jsPDF function to state
                resolve();
              } else {
                console.error("jsPDF not found as a function on window.jspdf object after script load.");
                reject(new Error("jsPDF not loaded correctly."));
              }
            };
            script.onerror = (e) => {
              console.error("Failed to load jsPDF script:", e);
              reject(e);
            };
            document.head.appendChild(script);
          });
        } else {
          setJsPDF(() => window.jspdf.jsPDF);
        }

        // Load html2canvas library
        if (!window.html2canvas) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
            script.onload = () => {
              console.log("html2canvas script loaded. window.html2canvas:", window.html2canvas);
              if (typeof window.html2canvas === 'function') {
                setHtml2canvasLib(() => window.html2canvas); // Set html2canvas function to state
                resolve();
              } else {
                console.error("html2canvas not found as a function on window object after script load.");
                reject(new Error("html2canvas not loaded correctly."));
              }
            };
            script.onerror = (e) => {
              console.error("Failed to load html2canvas script:", e);
              reject(e);
            };
            document.head.appendChild(script);
          });
        } else {
          setHtml2canvasLib(() => window.html2canvas);
        }
      } catch (error) {
        console.error("Failed to load scripts:", error);
        setMessage("Error loading PDF libraries. Please try again.");
      }
    };

    loadScripts();
  }, []);

  // Sample quotation data
  const quotation = {
    quotationNumber: "QT-2025-001",
    supplier: "บริษัท สมาร์ทแมชชีน จำกัด",
    item: "เครื่องจักร CNC รุ่น X200",
    quantity: 1,
    price: 350000,
    vat: 24500,
    total: 374500,
  };

  // Function to generate a canvas image from the form content
  const generateCanvas = async () => {
    console.log("generateCanvas called.");
    console.log("html2canvasLib state:", html2canvasLib);
    console.log("formRef.current:", formRef.current);

    const currentHtml2canvas = html2canvasLib;

    if (!currentHtml2canvas || !formRef.current) {
      setMessage("PDF libraries not loaded yet or form element not found.");
      console.error("Pre-check failed: currentHtml2canvas:", currentHtml2canvas, "formRef.current:", formRef.current);
      return null;
    }
    setLoading(true);
    setMessage("Generating document...");
    try {
      const canvas = await currentHtml2canvas(formRef.current, {
        backgroundColor: '#FFFFFF', // Explicitly set background to white for the captured area
        useCORS: true, // Important for handling images from different origins if any
        scale: 2, // Increase scale for better resolution in PDF
      });
      setLoading(false);
      setMessage("");
      return canvas;
    } catch (error) {
      console.error("Error generating canvas:", error);
      setLoading(false);
      setMessage("Error generating document. Please try again.");
      return null;
    }
  };

  // Function to preview the generated PDF as an image
  const previewPDF = async () => {
    setPreviewImage(null); // Clear previous preview
    const canvas = await generateCanvas();
    if (canvas) {
      const imgData = canvas.toDataURL("image/png"); // Convert canvas to PNG data URL
      setPreviewImage(imgData); // Set the image data for preview
    }
  };

  // Function to export the generated PDF
  const exportPDF = async () => {
    if (!jsPDF) {
      setMessage("PDF library not loaded yet.");
      return;
    }
    const canvas = await generateCanvas();
    if (canvas) {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4"); // Initialize jsPDF with portrait, mm units, A4 size
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Add image to PDF, ensuring it fits within the page
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PR-${quotation.quotationNumber}.pdf`); // Save the PDF with a dynamic filename
      setMessage("PDF downloaded successfully!");
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}> {/* Use d-flex for sidebar layout */}
      <Sidebar /> {/* Render the Sidebar component */}
      <div className="flex-grow-1 p-4" style={{ background: "#f3f7f1" }}> {/* Main content area */}
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-success">📝 ใบขอซื้อ (Purchase Request)</h2>
            <p className="text-muted">แสดงข้อมูลจากใบเสนอราคา พร้อมดาวน์โหลดเป็น PDF</p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-7 col-md-9">
              <div
                className="card shadow-lg p-4 border-0 rounded-4 bg-white"
                ref={formRef} // Reference for html2canvas to capture this element
              >
                <h5 className="fw-semibold text-primary mb-3">📋 ข้อมูลใบเสนอราคา</h5>

                <div className="mb-2">
                  <strong>เลขที่ใบเสนอราคา:</strong> {quotation.quotationNumber}
                </div>
                <div className="mb-2">
                  <strong>ผู้จำหน่าย:</strong> {quotation.supplier}
                </div>
                <div className="mb-2">
                  <strong>รายการ:</strong> {quotation.item}
                </div>
                <div className="mb-2">
                  <strong>จำนวน:</strong> {quotation.quantity}
                </div>
                <div className="mb-2">
                  <strong>ราคาต่อหน่วย:</strong> {quotation.price.toLocaleString()} บาท
                </div>
                <div className="mb-2">
                  <strong>ภาษีมูลค่าเพิ่ม (7%):</strong> {quotation.vat.toLocaleString()} บาท
                </div>
                <hr />
                <div className="mb-2">
                  <strong className="text-success">รวมทั้งสิ้น:</strong>{" "}
                  <span className="fw-bold text-success fs-5">
                    {quotation.total.toLocaleString()} บาท
                  </span>
                </div>
              </div>

              <div className="text-center mt-4">
                <button
                  className="btn btn-outline-primary me-2 px-4"
                  onClick={previewPDF}
                  disabled={loading || !html2canvasLib} // Disable if loading or html2canvas not loaded
                >
                  {loading && message.includes("Generating") ? "Generating Preview..." : "Preview"}
                </button>
                <button
                  className="btn btn-success px-4"
                  onClick={exportPDF}
                  disabled={loading || !jsPDF || !html2canvasLib} // Disable if loading or libraries not loaded
                >
                  📥 {loading && message.includes("Generating") ? "Generating PDF..." : "ดาวน์โหลดเป็น PDF"}
                </button>
              </div>

              {message && (
                <div className="text-center mt-4 text-secondary">
                  {message}
                </div>
              )}

              {/* Preview Section */}
              {previewImage && (
                <div className="text-center mt-5">
                  <h6 className="text-muted mb-2">🔍 ตัวอย่างเอกสาร</h6>
                  <div className="bg-white p-3 border border-secondary rounded-4 shadow-lg">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="img-fluid rounded"
                      style={{
                        border: "1px solid #ccc",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
