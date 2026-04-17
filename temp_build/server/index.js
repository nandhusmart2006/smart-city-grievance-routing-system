require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getAllComplaints, getComplaintByTicketId, updateComplaintStatus, getDashboardStats } = require('./database');
const { submitGrievance } = require('./controllers/grievanceController');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main Entry Point for Citizens
app.post('/complaint', submitGrievance);

app.get('/api/grievances/dashboard', async (req, res) => {
    try {
        const stats = await getDashboardStats();
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/complaints', async (req, res) => {
    try {
        const complaints = await getAllComplaints();
        res.status(200).json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/complaint/:id', async (req, res) => {
    try {
        const ticketId = req.params.id;
        const complaint = await getComplaintByTicketId(ticketId);
        
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }
        
        res.status(200).json(complaint);
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.patch('/complaint/:id', async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required.' });
        }
        
        // Update grievance status and clear breach flag if resolved
        const isSlaBreachWarning = status === 'RESOLVED' ? false : undefined;
        await updateComplaintStatus(ticketId, status, isSlaBreachWarning);
        
        res.status(200).json({ message: 'Complaint status updated successfully.' });
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
