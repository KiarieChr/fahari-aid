import React, { createContext, useState, useEffect } from 'react';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);

    // Load events from local storage on mount
    useEffect(() => {
        const savedEvents = localStorage.getItem('app-events');
        if (savedEvents) {
            setEvents(JSON.parse(savedEvents));
        } else {
            // Initialize with some mock data if empty
            const initialEvents = [
                { id: 1, name: 'Worship Night', date: '2026-02-15', time: '18:00', location: 'Main Sanctuary', rsvpRequired: true, status: 'Upcoming', registrations: [] },
                { id: 2, name: 'Leaders Retreat', date: '2026-03-02', time: '08:00', location: 'Naivasha', rsvpRequired: true, status: 'Registration Open', registrations: [] },
            ];
            setEvents(initialEvents);
            localStorage.setItem('app-events', JSON.stringify(initialEvents));
        }
    }, []);

    // Save events to local storage whenever they change
    useEffect(() => {
        localStorage.setItem('app-events', JSON.stringify(events));
    }, [events]);

    const addEvent = (newEvent) => {
        const eventWithId = { ...newEvent, id: Date.now(), registrations: [], status: 'Upcoming' };
        setEvents(prev => [...prev, eventWithId]);
    };

    const updateEvent = (updatedEvent) => {
        setEvents(prev => prev.map(event => event.id === updatedEvent.id ? updatedEvent : event));
    };

    const deleteEvent = (eventId) => {
        setEvents(prev => prev.filter(event => event.id !== eventId));
    };

    const registerForEvent = (eventId, registrationData) => {
        setEvents(prev => prev.map(event => {
            if (event.id === parseInt(eventId)) {
                return { ...event, registrations: [...(event.registrations || []), { ...registrationData, id: Date.now(), date: new Date().toISOString() }] };
            }
            return event;
        }));
    };

    const getEventById = (eventId) => {
        return events.find(event => event.id === parseInt(eventId));
    };

    return (
        <EventContext.Provider value={{ events, addEvent, updateEvent, deleteEvent, registerForEvent, getEventById }}>
            {children}
        </EventContext.Provider>
    );
};
