import Breadcrumb from '../../components/shared/Breadcrumb';
import './ReportsPage.css';

export default function ReportsPage() {
  return (
    <div className="reports-page">
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Report Archive' }]} />
      <div className="reports-card">
        <h1>Report Archive</h1>
        <p>
          Consolidated report archives, PACS integrations, and advanced search will be implemented in a follow-up
          iteration. Use the imaging queue to finalize and publish radiology impressions.
        </p>
      </div>
    </div>
  );
}

