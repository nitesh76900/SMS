import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, X } from "lucide-react";

const ResultModal = ({ student, onClose }) => {
  console.log('student in result modal ', student)
  const resultRef = useRef(null);

  if (!student) return null;
  const calculateTotalMarks = () => {
    return student.marks.reduce((acc, mark) => acc + mark.mark, 0);
  }
  const calculatePercentage = () => {
    const totalMarks = student.marks.reduce((acc, mark) => acc + mark.mark, 0);
    const maxMarks = student.marks.length * 100; // Assuming max marks is 100 for each subject
    return ((totalMarks / maxMarks) * 100).toFixed(2);
  };

  const getGradeColor = (mark) => {
    if (mark >= 90) return "text-green-700"; // A+
    if (mark >= 80) return "text-green-600"; // A
    if (mark >= 70) return "text-blue-700"; // B+
    if (mark >= 60) return "text-blue-600"; // B
    if (mark >= 50) return "text-orange-600"; // C
    return "text-red-600"; // F
  };

  const getGrade = (mark) => {
    if (mark >= 90) return "A+";
    if (mark >= 80) return "A";
    if (mark >= 70) return "B+";
    if (mark >= 60) return "B";
    if (mark >= 50) return "C";
    return "F";
  };

  const exportToPDF = () => {
    const content = resultRef.current;
    html2canvas(content).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${student.studentId.name}_result.pdf`);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-scroll">
      <div className="bg-white rounded-lg w-full max-w-3xl overflow-hidden shadow-lg">
        <div ref={resultRef}>
          <div className="p-6">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center rounded-lg mt-14">
              <h2 className="text-white text-lg font-semibold">
                Student Result
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                >
                  <Download size={16} /> Export PDF
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                >
                  <X size={20} /> Close
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-200 mb-6"></div>

            {/* Student Information */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-2">
                    <span className="font-semibold">Name:</span>{" "}
                    {student.studentId.name}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Class:</span>{" "}
                    {student.studentId.class.name}-
                    {student.studentId.class.section}
                  </p>
                </div>
                <div>
                  <p className="mb-2">
                    <span className="font-semibold">Registration No:</span>{" "}
                    {student.studentId.registrationNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Marks Table */}
            <div className="shadow rounded-lg overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-center font-semibold">
                      Max Marks
                    </th>
                    <th className="px-6 py-3 text-center font-semibold">
                      Marks Obtained
                    </th>
                    <th className="px-6 py-3 text-center font-semibold">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {student.marks.map((mark, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-6 py-4">{mark.subject}</td>
                      <td className="px-6 py-4 text-center">100</td>
                      <td className="px-6 py-4 text-center">{mark.mark}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`font-semibold ${getGradeColor(
                            mark.mark
                          )}`}
                        >
                          {getGrade(mark.mark)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 border-t">
                    <td className="px-6 py-4 font-semibold">Total</td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {student.marks.length * 100}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {calculateTotalMarks()}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      <span
                        className={
                          student.result ? "text-green-700" : "text-red-600"
                        }
                      >
                        {calculatePercentage()}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Result Summary */}
            <div
              className={`flex justify-between items-center p-4 rounded-lg ${
                student.result ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <h3 className="text-lg font-semibold">
                Final Result:{" "}
                <span
                  className={student.result ? "text-green-700" : "text-red-600"}
                >
                  {student.result ? "PASS" : "FAIL"}
                </span>
              </h3>
              <h3 className="text-lg font-semibold">
                Percentage:{" "}
                <span
                  className={student.result ? "text-green-700" : "text-red-600"}
                >
                  {calculatePercentage()}%
                </span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
