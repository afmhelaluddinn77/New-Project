import Breadcrumb from '../../components/shared/Breadcrumb';
import './LogsPage.css';

export default function LogsPage() {
  return (
    <div className="logs-page">
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Dispense Log' }]} />
      <div className="logs-card">
        <h1>Dispense Log</h1>
        <p>
          Detailed dispense history, receipt generation, and reconciliation workflows will be added in the next
          sprint. Use the verification queue to process active orders.
        </p>
      </div>
    </div>
  );
}

