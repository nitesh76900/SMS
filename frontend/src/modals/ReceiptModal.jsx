import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import StudentService from "../services/studentServices";
import { Loader } from "lucide-react";

const ReceiptModal = ({ receiptId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const response = await StudentService.getReceiptById(receiptId);
        console.log("response", response);
        setReceiptData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load receipt. Please try again.");
        console.error("Error fetching receipt:", err);
      } finally {
        setLoading(false);
      }
    };

    if (receiptId) {
      fetchReceipt();
    }
  }, [receiptId]);

  const handleDownloadPdf = () => {
    const input = document.getElementById("receipt-content");
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const yOffset = (pdfHeight - imgHeight) / 2;

        pdf.addImage(imgData, "PNG", 10, yOffset, imgWidth, imgHeight);
        pdf.save(
          `${receiptData?.studentId?.name || "receipt"}_${new Date().toLocaleDateString()}.pdf`
        );
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        setError("Failed to generate PDF. Please try again.");
      });
  };

  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  if (!showModal) return null;

  const feeDetails = receiptData?.studentId?.feeStructure
    ? [
        {
          type: "Admission Fee",
          amount: receiptData.studentId.feeStructure.addmissionFee,
        },
        {
          type: "Tuition Fee",
          amount: receiptData.studentId.feeStructure.tuitionFee,
        },
        {
          type: "Computer Fee",
          amount: receiptData.studentId.feeStructure.computerFee,
        },
        { type: "Exam Fee", amount: receiptData.studentId.feeStructure.examFee },
        { type: "Fine", amount: receiptData.studentId.feeStructure.fine },
        {
          type: "Miscellaneous",
          amount: receiptData.studentId.feeStructure.miscellaneous,
        },
      ]
    : [];

  return (
    <div className="fixed z-20 inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center overflow-hidden mx-auto">
      <div className="relative w-full max-w-4xl h-[90vh] mx-4 bg-white rounded-xl shadow-2xl">
        {/* Header with close button */}
        <div className="absolute top-0 left-0 right-0 bg-white z-10 rounded-t-xl border-b">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-2xl font-bold text-gray-800">Fee Receipt</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto h-full pt-20 pb-24">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : (
            <div id="receipt-content" className="p-6">
              {/* Receipt Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Student Details
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Name:</span>{" "}
                        <span className="text-gray-800">
                          {receiptData?.studentId?.name}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Registration:</span>{" "}
                        <span className="text-gray-800">
                          {receiptData?.studentId?.registrationNumber}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Batch:</span>{" "}
                        <span className="text-gray-800">
                          {receiptData?.studentId?.batch}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Parent Details
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Father's Name:</span>{" "}
                        <span className="text-gray-800">
                          {receiptData?.parentId?.fatherName}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Mother's Name:</span>{" "}
                        <span className="text-gray-800">
                          {receiptData?.parentId?.motherName}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Date:</span>{" "}
                        <span className="text-gray-800">
                          {new Date(receiptData?.dateTime).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-600">
                  <span className="font-medium">Description:</span>{" "}
                  <span className="text-gray-800">
                    {receiptData?.description}
                  </span>
                </p>
              </div>

              {/* Fee Details Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="py-3 px-6 text-left">Fee Type</th>
                      <th className="py-3 px-6 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeDetails.map(
                      (item, idx) =>
                        item.amount > 0 && (
                          <tr
                            key={idx}
                            className={`${
                              idx % 2 ? "bg-gray-50" : "bg-white"
                            } border-b border-gray-100`}
                          >
                            <td className="py-3 px-6">{item.type}</td>
                            <td className="py-3 px-6 text-right">
                              ₹{item.amount.toLocaleString()}
                            </td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-700">
                      Deposit Amount:
                    </span>
                    <span className="text-green-600 font-bold">
                      ₹{receiptData?.depositFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-gray-600">Total Fee:</span>
                    <span className="font-medium">
                      ₹{receiptData?.studentId?.totalFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fees Paid:</span>
                    <span className="font-medium text-green-600">
                      ₹{receiptData?.studentId?.feesPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fees Due:</span>
                    <span className="font-medium text-red-600">
                      ₹{receiptData?.studentId?.feesDue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed bottom action bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end space-x-4">
          <button
            className="px-6 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium"
            onClick={handleClose}
          >
            Close
          </button>
          <button
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium"
            onClick={handleDownloadPdf}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;