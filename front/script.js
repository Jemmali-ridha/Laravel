// Global variable to store collections data
let collectionsData = {};

// Function to load CSV data
async function loadCSVData() {
    try {
        const response = await fetch('data.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');

        // Clear existing data
        collectionsData = {};

        // Skip header row and process each line
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            const values = lines[i].split(',');
            const id = values[0];
            
            // Create object with properties from CSV
            collectionsData[id] = {};
            for (let j = 0; j < headers.length; j++) {
                collectionsData[id][headers[j]] = values[j];
            }
        }
        console.log('CSV data loaded:', collectionsData);
        return collectionsData;
    } catch (error) {
        console.error('Error loading CSV:', error);
        return {};
    }
}

// Function to populate the collections table
function populateCollectionsTable() {
    const tableBody = document.getElementById('collectionsTableBody');
    if (!tableBody) return;

    // Clear existing content
    tableBody.innerHTML = '';

    // Add each collection to the table
    Object.values(collectionsData).forEach(collection => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${collection.title}</td>
            <td>${collection.target}</td>
            <td>${collection.current}</td>
            <td>${collection.donors}</td>
            <td><span class="status-badge ${collection.status}">${collection.status === 'success' ? 'En cours' : 'Besoin attention'}</span></td>
            <td>${collection.daysLeft} jours</td>
            <td>
                <a href="collection-details.html?id=${collection.id}" class="view-btn"><i class="fas fa-eye"></i> Voir</a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to load collection details
async function loadCollectionDetails(collectionId) {
    try {
        // Load CSV data if not already loaded
        if (Object.keys(collectionsData).length === 0) {
            await loadCSVData();
        }

        const collection = collectionsData[collectionId];
        if (!collection) {
            console.error('Collection not found:', collectionId);
            return;
        }

        // Update page title
        document.title = `${collection.title} - Cha9a9a.tn`;

        // Update collection details
        document.getElementById('collectionTitle').textContent = collection.title;
        document.getElementById('collectionStatus').textContent = collection.status === 'success' ? 'En cours' : 'Besoin attention';
        document.getElementById('collectionStatus').className = `status-badge ${collection.status}`;

        // Update general information
        document.getElementById('collectionCreator').textContent = collection.creator;
        document.getElementById('collectionDate').textContent = collection.creationDate;
        document.getElementById('collectionEndDate').textContent = collection.endDate;

        // Update progress information
        document.getElementById('collectionTarget').textContent = collection.target;
        document.getElementById('collectionCurrent').textContent = collection.current;
        document.getElementById('collectionPercentage').textContent = `${collection.percentage}%`;
        document.getElementById('progressBar').style.width = `${collection.percentage}%`;

        // Update description
        document.getElementById('collectionDescription').innerHTML = `<p>${collection.description}</p>`;

        // Update statistics
        document.getElementById('donorsCount').textContent = collection.donors;
        document.getElementById('avgDonation').textContent = collection.avgDonation;
        document.getElementById('daysLeft').textContent = collection.daysLeft;
    } catch (error) {
        console.error('Error loading collection details:', error);
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load CSV data first
        await loadCSVData();

        // Initialize collection details if we're on the details page
        if (window.location.pathname.includes('collection-details.html')) {
            const collectionId = new URLSearchParams(window.location.search).get('id');
            if (collectionId) {
                await loadCollectionDetails(collectionId);
            }
        } else {
            // Populate collections table if we're on the main page
            const tableBody = document.getElementById('collectionsTableBody');
            if (tableBody) {
                populateCollectionsTable();
            }
        }
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});
