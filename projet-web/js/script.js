document.addEventListener('DOMContentLoaded', function() {
    // Initialize event handlers
    initializeEventHandlers();
    // Load events
    loadEvents();
});

function initializeEventHandlers() {
    // Form toggle handlers
    const addEventBtn = document.getElementById('addEventBtn');
    const closeFormBtn = document.getElementById('closeForm');
    const formSection = document.getElementById('eventFormSection');

    addEventBtn.addEventListener('click', () => {
        formSection.classList.remove('hidden');
        document.getElementById('eventName').focus();
    });

    closeFormBtn.addEventListener('click', () => {
        formSection.classList.add('hidden');
        document.getElementById('eventForm').reset();
    });

    // View toggle handlers
    const viewBtns = document.querySelectorAll('.view-btn');
    const eventsList = document.getElementById('eventsList');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            eventsList.className = view === 'grid' ? 'events-grid' : 'events-list';
        });
    });

    // Form submission handler
    document.getElementById('eventForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        fetch('php/save_event.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Event added successfully!', 'success');
                this.reset();
                formSection.classList.add('hidden');
                loadEvents();
            } else {
                showNotification('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error adding event. Please try again.', 'error');
        });
    });
}

function loadEvents() {
    fetch('php/get_events.php')
        .then(response => response.json())
        .then(events => {
            const eventsListDiv = document.getElementById('eventsList');
            eventsListDiv.innerHTML = '';
            
            if (events.length === 0) {
                showEmptyState(eventsListDiv);
                return;
            }

            events.forEach(event => {
                const eventCard = createEventCard(event);
                eventsListDiv.appendChild(eventCard);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error loading events. Please try again.', 'error');
        });
}

function createEventCard(event) {
    const div = document.createElement('div');
    div.className = 'event-card';
    
    const date = new Date(event.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    div.innerHTML = `
        <h3>${event.name}</h3>
        <div class="event-info">
            <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
            <p><i class="fas fa-clock"></i> ${event.time}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            <p><i class="fas fa-align-left"></i> ${event.description || 'No description provided'}</p>
        </div>
        <button class="delete-btn" onclick="deleteEvent(${event.id})">
            <i class="fas fa-trash"></i> Delete Event
        </button>
    `;
    
    return div;
}

function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        fetch(`php/delete_event.php?id=${eventId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Event deleted successfully!', 'success');
                    loadEvents();
                } else {
                    showNotification('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error deleting event. Please try again.', 'error');
            });
    }
}

function showEmptyState(container) {
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <h3>No Events Found</h3>
            <p>Click the "New Event" button to add your first event!</p>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
