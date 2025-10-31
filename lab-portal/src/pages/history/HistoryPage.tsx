import Breadcrumb from '../../components/shared/Breadcrumb';
import './HistoryPage.css';

export default function HistoryPage() {
  return (
    <div className="history-page">
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'History' }]} />
      <div className="history-card">
        <h1>Historical Results</h1>
        <p>
          Integration with long-term result archival is coming soon. Use the unified timeline or export from the
          laboratory information system for deeper analytics.
        </p>
      </div>
    </div>
  );
}

