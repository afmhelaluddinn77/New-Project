import React from 'react'

type Row = { day: string; date: string; time?: string; closed?: boolean; present?: boolean }

const rows: Row[] = [
  { day: 'Saturday', date: '8 Nov 2025', time: '06:00 PM - 09:00 PM' },
  { day: 'Sunday', date: '9 Nov 2025', time: '06:00 PM - 09:00 PM' },
  { day: 'Monday', date: '10 Nov 2025', time: '06:00 PM - 09:00 PM' },
  { day: 'Tuesday', date: '11 Nov 2025', time: '06:00 PM - 09:00 PM' },
  { day: 'Wednesday', date: '12 Nov 2025', time: '06:00 PM - 09:00 PM' },
  { day: 'Thursday', date: '6 Nov 2025', closed: true, present: true },
  { day: 'Friday', date: '7 Nov 2025', closed: true },
]

export default function AppointmentSchedule() {
  return (
    <section className="schedule-card">
      <h3 className="schedule-title">Chamber Schedule of Dr. A. F. M. Helal Uddin</h3>
      <div className="schedule-room">Room No : 201</div>
      <div className="schedule-table-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Day Name</th>
              <th>Consultation Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r.present ? 'present' : ''}>
                <td>
                  {r.day}, {r.date} {r.present && <span className="present-badge">(present day)</span>}
                </td>
                <td className={r.closed ? 'closed' : ''}>{r.closed ? 'Closed' : r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="schedule-note">
        For serial, Please call within 10 am to 2 pm two days before the appointment date 
        <span className="note-phones"> 01916658525, 01681006412, 01847199190 (Mr. Rashid)</span>
      </div>
    </section>
  )
}
