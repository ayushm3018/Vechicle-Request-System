# Vehicle Requisition Management System

A comprehensive full-stack web application for managing vehicle requisition requests in an organization. Built with React.js frontend, Express.js backend, and MySQL database.

## 🚗 Features

### Employee Features
- **User Authentication**: Secure login with JWT tokens
- **Vehicle Request Form**: Submit vehicle requisition with detailed information
- **Dashboard**: View request status, statistics, and history
- **Real-time Status Updates**: Track request approval/rejection status
- **Email Notifications**: Receive updates on request status changes

### Admin Features
- **Dashboard**: Overview of all requests and system statistics
- **Request Management**: Review, approve, or reject vehicle requests
- **Vehicle Assignment**: Assign available vehicles to approved requests
- **Email Notifications**: Get notified of new requests
- **Comprehensive Filtering**: Filter requests by status, date, etc.
- **Pagination**: Handle large volumes of requests efficiently

### System Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Email Notifications**: Automated email system using Nodemailer
- **Secure Authentication**: JWT-based authentication with role-based access
- **Data Validation**: Comprehensive input validation on both client and server
- **Error Handling**: Robust error handling and user feedback
- **Loading States**: Smooth user experience with loading indicators

## 🛠 Technical Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MySQL**: Relational database management system
- **JWT**: JSON Web Token for authentication
- **Nodemailer**: Email sending capability
- **bcrypt**: Password hashing and security

### Security & Performance
- **Helmet**: Security middleware
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Server-side validation with express-validator
- **SQL Injection Prevention**: Parameterized queries
- **CORS**: Cross-origin resource sharing configuration

## 📋 Database Schema

### Users Table
```sql
- id (Primary Key)
- name
- email (Unique)
- password (Hashed)
- designation
- role (employee/admin)
- created_at, updated_at
```

### Vehicle Requests Table
```sql
- id (Primary Key)
- employee_id (Foreign Key)
- officer_name
- designation
- required_date
- required_time
- report_place
- places_to_visit
- journey_purpose
- release_time
- status (pending/approved/rejected)
- rejection_reason
- created_at, updated_at
```

### Vehicles Table
```sql
- id (Primary Key)
- vehicle_number (Unique)
- make_model
- driver_name
- is_available
- created_at, updated_at
```

### Approved Requests Table
```sql
- id (Primary Key)
- request_id (Foreign Key)
- vehicle_id (Foreign Key)
- approved_by (Foreign Key)
- approved_at
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd vehicle-requisition-system
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE vehicle_requisition_db;
```

2. Import the schema:
```bash
mysql -u root -p vehicle_requisition_db < database/schema.sql
```

### Step 4: Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vehicle_requisition_db
DB_PORT=3306

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=ayushmishra3018@gmail.com
EMPLOYEE_EMAIL=kenmishra3018@gmail.com

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 5: Email Setup (Gmail)
1. Enable 2-Factor Authentication in your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in EMAIL_PASS

### Step 6: Start the Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Backend only
npm run server

# Frontend only  
npm run client
```

## 📱 Usage

### Demo Accounts
The system comes with pre-configured demo accounts:

**Admin Account:**
- Email: `admin@company.com`
- Password: `admin123`

**Employee Account:**
- Email: `john.doe@company.com` 
- Password: `employee123`

### Employee Workflow
1. Login with employee credentials
2. Navigate to "New Request" 
3. Fill vehicle requisition form with:
   - Officer name and designation
   - Required date and time
   - Report location for driver
   - Places to visit
   - Journey purpose
   - Expected release time
4. Submit request
5. Monitor status on dashboard
6. Receive email notifications for status updates

### Admin Workflow
1. Login with admin credentials
2. View dashboard for system overview
3. Navigate to "All Requests" for request management
4. Review pending requests:
   - Approve: Select vehicle to assign
   - Reject: Provide reason for rejection
5. Monitor system statistics and vehicle availability

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - User login
GET /api/auth/profile - Get user profile
POST /api/auth/verify - Verify JWT token
POST /api/auth/logout - User logout
```

### Vehicle Requests
```
POST /api/requests - Submit new request (Employee)
GET /api/requests/my-requests - Get user's requests (Employee)
GET /api/requests - Get all requests (Admin)
GET /api/requests/:id - Get single request (Admin)
POST /api/requests/:id/approve - Approve request (Admin)
POST /api/requests/:id/reject - Reject request (Admin)
GET /api/requests/stats/dashboard - Get dashboard statistics (Admin)
```

### Vehicles
```
GET /api/vehicles - Get all vehicles (Admin)
GET /api/vehicles/available - Get available vehicles (Admin)
GET /api/vehicles/:id - Get single vehicle (Admin)
POST /api/vehicles - Add new vehicle (Admin)
PUT /api/vehicles/:id - Update vehicle (Admin)
DELETE /api/vehicles/:id - Delete vehicle (Admin)
```

## 📧 Email Notifications

The system sends automated email notifications for:

1. **New Request Submitted** → Admin receives notification
2. **Request Approved** → Employee receives approval with vehicle details
3. **Request Rejected** → Employee receives rejection with reason

Email templates include:
- Professional HTML formatting
- Complete request details
- Vehicle assignment information (for approvals)
- Rejection reasons (for rejections)
- Responsive design for mobile devices

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Role-Based Access Control**: Separate employee and admin permissions
- **Input Validation**: Comprehensive validation on both client and server
- **SQL Injection Prevention**: Parameterized queries with mysql2
- **Rate Limiting**: API request throttling to prevent abuse
- **CORS Configuration**: Controlled cross-origin access
- **Helmet Security**: Security headers and protection middleware

## 🎨 Design Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI/UX**: Clean, professional interface design
- **Loading States**: Smooth user experience with loading indicators
- **Error Handling**: User-friendly error messages and feedback
- **Status Indicators**: Visual badges for request statuses
- **Interactive Elements**: Hover states and smooth transitions
- **Accessibility**: Semantic HTML and keyboard navigation support

## 📊 System Architecture

```
Frontend (React)
    ↓ HTTP/HTTPS
Backend (Express.js)
    ↓ MySQL2
Database (MySQL)
    ↓ Nodemailer
Email Service (SMTP)
```

## 🧪 Development Features

- **Environment Configuration**: Separate development/production configs
- **Error Logging**: Comprehensive error logging and debugging
- **Hot Reloading**: Development server with auto-refresh
- **Code Organization**: Modular architecture with clear separation of concerns
- **Validation**: Client-side and server-side input validation
- **Database Pooling**: Connection pooling for optimal performance

## 📝 Customization

### Adding New Fields
1. Update database schema in `database/schema.sql`
2. Update API validation in `backend/routes/requests.js`
3. Update frontend forms in `src/pages/Employee/VehicleRequestForm.jsx`
4. Update display components for new fields

### Email Templates
Customize email templates in `backend/utils/emailService.js`:
- Modify HTML structure
- Update styling and branding
- Add new notification types

### UI Theming
Customize design in Tailwind classes:
- Update color schemes
- Modify spacing and typography
- Adjust responsive breakpoints

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error:**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists and schema is imported

**Email Not Sending:**
- Verify Gmail App Password setup
- Check EMAIL_* variables in `.env`
- Ensure less secure app access is enabled

**Frontend Not Loading:**
- Check if backend server is running on port 5000
- Verify CORS configuration
- Check browser console for errors

**Authentication Issues:**
- Verify JWT_SECRET is set in `.env`
- Check token expiration (24 hours default)
- Clear browser localStorage and login again

### Performance Optimization

- Enable MySQL query caching
- Implement Redis for session storage
- Add database indexing for frequent queries
- Use CDN for static assets in production

## 📈 Future Enhancements

- **Real-time Notifications**: WebSocket integration
- **Mobile App**: React Native mobile application
- **Advanced Reporting**: Analytics and reporting dashboard
- **Vehicle Tracking**: GPS integration for vehicle location
- **Maintenance Scheduling**: Vehicle maintenance management
- **Multi-tenant Support**: Support for multiple organizations
- **Document Upload**: Attachment support for requests
- **Calendar Integration**: Google Calendar sync for vehicle schedules

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Contact: [Your contact information]
- Documentation: [Link to detailed docs]

---

**Built with ❤️ using React, Express.js, and MySQL**