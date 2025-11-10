import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/investigations.module.css';

export const InvestigationOrders: React.FC = () => {
  const { investigations, updateInvestigations } = useEncounterStore();
  const orders = investigations.investigations;

  const handleUpdateOrder = (index: number, field: string, value: any) => {
    const updated = [...orders];
    updated[index] = { ...updated[index], [field]: value };
    updateInvestigations('investigations', updated);
  };

  const handleRemoveOrder = (index: number) => {
    updateInvestigations('investigations', orders.filter((_, i) => i !== index));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'stat':
        return '#ef4444';
      case 'urgent':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div className={styles.section}>
      <h3>Investigation Orders Summary</h3>

      {orders.length === 0 ? (
        <p className={styles.emptyMessage}>No investigations ordered</p>
      ) : (
        <div className={styles.ordersSummary}>
          <div className={styles.ordersStats}>
            <div className={styles.stat}>
              <strong>{orders.length}</strong>
              <span>Total Orders</span>
            </div>
            <div className={styles.stat}>
              <strong>{orders.filter((o) => o.urgency === 'routine').length}</strong>
              <span>Routine</span>
            </div>
            <div className={styles.stat}>
              <strong>{orders.filter((o) => o.urgency === 'urgent').length}</strong>
              <span>Urgent</span>
            </div>
            <div className={styles.stat}>
              <strong>{orders.filter((o) => o.urgency === 'stat').length}</strong>
              <span>STAT</span>
            </div>
          </div>

          <div className={styles.ordersList}>
            {orders.map((order, index) => (
              <div key={index} className={styles.orderItem}>
                <div
                  className={styles.urgencyIndicator}
                  style={{ backgroundColor: getUrgencyColor(order.urgency) }}
                />
                <div className={styles.orderContent}>
                  <strong>{order.testName}</strong>
                  <div className={styles.orderMeta}>
                    <span className={styles.code}>{order.testCode}</span>
                    <span className={`${styles.urgency} ${styles[order.urgency]}`}>
                      {order.urgency.toUpperCase()}
                    </span>
                    {order.notes && <span className={styles.notes}>{order.notes}</span>}
                  </div>
                </div>
                <div className={styles.orderActions}>
                  <select
                    value={order.urgency}
                    onChange={(e) =>
                      handleUpdateOrder(index, 'urgency', e.target.value)
                    }
                    className={styles.urgencySelect}
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                  </select>
                  <button
                    onClick={() => handleRemoveOrder(index)}
                    className={styles.removeButton}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
