import React, { useState } from 'react';
import ExpenseDetail2, { TransactionDetail } from './ExpenseDetail2';
import Filter from './FilterSection';
import TableRecentTransactions from "./TableRecentTrasactions"
import AddNewTrasaction from './AddNewTransaction';

interface ExpenseFeedProps {
  title?: string;
}

const ExpenseFeed: React.FC<ExpenseFeedProps> = ({ title = 'Expense Feed' }) => {
  // Estado del modal de creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partialData, setPartialData] = useState<{ category: string; amount: number } | null>(null);

  // Estado del drawer de detalle — antes vivía implícitamente en el DOM (getElementById),
  // ahora vive aquí y se pasa como props a ExpenseDetail2.
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);

  // const openPartialModal = (category: string, suggestedAmount: number) => {
  //   setPartialData({ category, amount: suggestedAmount });
  //   setIsModalOpen(true);
  // };

  const openEmptyModal = () => {
    setPartialData(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (transaction: TransactionDetail) => {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  };

  return (
    <section>
      <main className="min-h-screen">
        <div className="p-lg space-y-lg">
            <div className="flex justify-end">
              <button
                className="py-md px-lg bg-primary text-on-primary rounded-lg font-body-md font-bold flex items-center gap-xs shadow-md hover:opacity-90"
                onClick={openEmptyModal}>
              <span className="material-symbols-outlined" data-icon="add">add</span>
              Add Transaction
              </button>
            </div>
          <Filter/>
          <TableRecentTransactions onRowClick={handleRowClick} />
        </div>
      </main>

      <AddNewTrasaction
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCategory={partialData?.category}
        initialAmount={partialData?.amount}
      />

      {/* Misma posición de siempre (fixed right-0 top-0), ahora controlado por estado */}
      <ExpenseDetail2
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        transaction={selectedTransaction}
      />
    </section>
  );
};

export default ExpenseFeed;