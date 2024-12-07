import React, { useState } from "react";
// import Modal from "./Modal";
// import Card from "./Card";

const ExpensesTab = () => {
  const [expenses, setExpenses] = useState([
    { id: 1, name: "Fuel Expense", amount: "$200", date: "2024-11-20", status: "completed" },
    { id: 2, name: "Maintenance", amount: "$500", date: "2024-11-19", status: "pending" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const handleSave = (data) => {
    if (currentData) {
      setExpenses(expenses.map((expense) => (expense.id === currentData.id ? data : expense)));
    } else {
      setExpenses([...expenses, { ...data, id: Date.now() }]);
    }
    setShowModal(false);
    setCurrentData(null);
  };

  const handleDelete = (id) => setExpenses(expenses.filter((expense) => expense.id !== id));

  return (
    <div>
      <header className="header">
        <input type="text" placeholder="Search expenses..." />
        <button onClick={() => { setCurrentData(null); setShowModal(true); }}>+ Add New</button>
      </header>
      <div className="card-list">
        {expenses.map((expense) => (
          <Card
            key={expense.id}
            data={expense}
            onEdit={() => { setCurrentData(expense); setShowModal(true); }}
            onDelete={() => handleDelete(expense.id)}
          />
        ))}
      </div>
      {showModal && <Modal data={currentData} onSave={handleSave} onCancel={() => setShowModal(false)} />}
    </div>
  );
};

export default ExpensesTab;
