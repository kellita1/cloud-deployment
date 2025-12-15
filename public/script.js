// Handle Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            category: document.getElementById('category').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            const statusDiv = document.getElementById('statusMessage');

            if (response.ok) {
                statusDiv.textContent = 'Message sent successfully!';
                statusDiv.className = 'message success';
                contactForm.reset();
            } else {
                statusDiv.textContent = result.error || 'Failed to send message.';
                statusDiv.className = 'message error';
            }
            statusDiv.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });
}

// Load Messages for Admin
async function loadMessages() {
    try {
        const response = await fetch('/messages');
        const messages = await response.json();
        const tbody = document.querySelector('#messagesTable tbody');
        tbody.innerHTML = '';

        messages.forEach(msg => {
            const tr = document.createElement('tr');
            const date = new Date(msg.created_at).toLocaleDateString();

            tr.innerHTML = `
                <td>${date}</td>
                <td>${msg.name}</td>
                <td><a href="mailto:${msg.email}">${msg.email}</a></td>
                <td>${msg.category}</td>
                <td>${msg.subject}</td>
                <td>
                    <select onchange="updateStatus(${msg.id}, this.value)" class="status-select">
                        <option value="new" ${msg.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="read" ${msg.status === 'read' ? 'selected' : ''}>Read</option>
                        <option value="replied" ${msg.status === 'replied' ? 'selected' : ''}>Replied</option>
                        <option value="closed" ${msg.status === 'closed' ? 'selected' : ''}>Closed</option>
                    </select>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Update Message Status
async function updateStatus(id, newStatus) {
    try {
        const response = await fetch(`/messages/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            alert('Failed to update status');
            // Reload to revert UI if failed
            loadMessages();
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status');
    }
}
