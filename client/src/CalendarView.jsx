import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import styled from '@emotion/styled';

const CalendarContainer = styled.div`
  .fc {
    background: #fff;
    color: #333;
  }
  .fc-header-toolbar {
    margin-bottom: 1rem;
  }
  .fc-button {
    background-color: #007bff;
    border: none;
    color: white;
  }
  .fc-button:hover {
    background-color: #0056b3;
  }
  .fc-event {
    background-color: #007bff;
    border: none;
    color: white;
    font-size: 0.85em;
  }
`;

const dummyOrders = [
  // build dummy data—matching your appliances and realistic times
];

// example: build by code helper
function generateDummyEvents() {
  const products = [
    { id: 'PRD_00001', name: 'TV (standalone)', duration: 15 + 60 },
    { id: 'PRD_00002', name: 'TV (wall bracket)', duration: 40 + 60 },
    { id: 'PRD_00003', name: 'Fridge', duration: 10 + 60 },
    { id: 'PRD_00006', name: 'Air Conditioner', duration: 60 + 60 },
  ];

  const addresses = [
    'The Troika, Jalan Ampang, Kuala Lumpur',
    'KL Trillion, Jalan Tun Razak, Kuala Lumpur',
    'Mont Kiara Aman, Jalan Kiara, Kuala Lumpur',
    'Setapak Green, Setapak, Kuala Lumpur',
    'Bangsar Park Residence, Bangsar, Kuala Lumpur',
    'OUG Parklane, Old Klang Road, Kuala Lumpur',
  ];

  const timeSlots = [
    { start: '09:00', end: '13:00' },
    { start: '14:00', end: '18:00' },
    { start: '19:00', end: '22:00' },
  ];

  const events = [];
  let id = 1;
  const today = new Date();
  const base = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 10)); // mid-month

  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const current = new Date(base);
    current.setDate(base.getDate() + dayOffset);
    const isoDay = current.toISOString().split('T')[0];

    timeSlots.forEach(slot => {
      const slotStart = new Date(`${isoDay}T${slot.start}:00`);
      let cursor = slotStart;
      const count = Math.floor(Math.random() * 2) + 2; // 2–3 events per slot

      for (let i = 0; i < count; i++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const evtStart = new Date(cursor);
        const evtEnd = new Date(evtStart.getTime() + prod.duration * 60000);
        if (evtEnd > new Date(`${isoDay}T${slot.end}:00`)) break;

        events.push({
          id: `evt-${id++}`,
          title: `${prod.name} @ ${addresses[Math.floor(Math.random() * addresses.length)]}`,
          start: evtStart.toISOString(),
          end: evtEnd.toISOString(),
        });
        cursor = new Date(evtEnd.getTime() + 10 * 60000); // +10m gap
      }
    });
  }
  return events;
}

export default function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(generateDummyEvents());
  }, []);

  return (
    <CalendarContainer>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        height="auto"
        nowIndicator
      />
    </CalendarContainer>
  );
}
