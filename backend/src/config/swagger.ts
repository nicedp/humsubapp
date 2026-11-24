import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Society Management Portal API',
      version: '1.0.0',
      description: 'REST API for the Society Management Portal — multi-society capable backend.',
      contact: {
        name: 'Society Admin',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from POST /api/v1/auth/login',
        },
      },
      schemas: {
        // ── Auth ────────────────────────────────────────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'Admin@123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/UserMe' },
          },
        },
        UserMe: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'owner', 'tenant', 'security'] },
            residentId: { type: 'string', nullable: true },
            staffId: { type: 'string', nullable: true },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 6 },
          },
        },
        // ── Flat ────────────────────────────────────────────────────────────
        Flat: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'F1-01' },
            floor: { type: 'integer', example: 1 },
            flatNumber: { type: 'string', example: '01' },
            flatType: { type: 'string', example: 'standard' },
            sqFt: { type: 'number', example: 850 },
            isOccupied: { type: 'boolean' },
            societyId: { type: 'integer', example: 1 },
          },
        },
        CreateFlatRequest: {
          type: 'object',
          required: ['id', 'floor', 'flatNumber', 'flatType', 'sqFt'],
          properties: {
            id: { type: 'string', example: 'F1-01' },
            floor: { type: 'integer', example: 1 },
            flatNumber: { type: 'string', example: '01' },
            flatType: { type: 'string', example: 'standard' },
            sqFt: { type: 'number', example: 850 },
          },
        },
        UpdateFlatRequest: {
          type: 'object',
          properties: {
            flatType: { type: 'string' },
            sqFt: { type: 'number' },
            isOccupied: { type: 'boolean' },
          },
        },
        // ── Resident ────────────────────────────────────────────────────────
        Resident: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            whatsapp: { type: 'string', nullable: true },
            flatId: { type: 'string' },
            residentType: { type: 'string', enum: ['owner', 'tenant'] },
            numCars: { type: 'integer' },
            numBikes: { type: 'integer' },
            societyId: { type: 'integer' },
          },
        },
        CreateResidentRequest: {
          type: 'object',
          required: ['name', 'email', 'phone', 'flatId', 'residentType'],
          properties: {
            name: { type: 'string', example: 'Ramesh Kumar' },
            email: { type: 'string', example: 'ramesh@example.com' },
            phone: { type: 'string', example: 'Enter Mobile Number' },
            whatsapp: { type: 'string', nullable: true },
            flatId: { type: 'string', example: 'F1-01' },
            residentType: { type: 'string', enum: ['owner', 'tenant'] },
            numCars: { type: 'integer', example: 1 },
            numBikes: { type: 'integer', example: 0 },
          },
        },
        UpdateResidentRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            whatsapp: { type: 'string', nullable: true },
            numCars: { type: 'integer' },
            numBikes: { type: 'integer' },
          },
        },
        // ── Vehicle ─────────────────────────────────────────────────────────
        Vehicle: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            residentId: { type: 'string' },
            flatId: { type: 'string' },
            vehicleType: { type: 'string', enum: ['car', 'bike', 'scooter', 'other'] },
            vehicleNumber: { type: 'string', example: 'MH12AB1234' },
            make: { type: 'string', nullable: true },
            model: { type: 'string', nullable: true },
            color: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
          },
        },
        CreateVehicleRequest: {
          type: 'object',
          required: ['vehicleType', 'vehicleNumber'],
          properties: {
            vehicleType: { type: 'string', enum: ['car', 'bike', 'scooter', 'other'] },
            vehicleNumber: { type: 'string', example: 'MH12AB1234' },
            make: { type: 'string' },
            model: { type: 'string' },
            color: { type: 'string' },
          },
        },
        UpdateVehicleRequest: {
          type: 'object',
          properties: {
            vehicleType: { type: 'string', enum: ['car', 'bike', 'scooter', 'other'] },
            make: { type: 'string' },
            model: { type: 'string' },
            color: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        // ── Billing ─────────────────────────────────────────────────────────
        Bill: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            flatId: { type: 'string' },
            month: { type: 'integer' },
            year: { type: 'integer' },
            amount: { type: 'number' },
            lateFee: { type: 'number' },
            status: { type: 'string', enum: ['unpaid', 'paid', 'overdue'] },
            dueDate: { type: 'string', format: 'date' },
            paidAt: { type: 'string', format: 'date-time', nullable: true },
            societyId: { type: 'integer' },
          },
        },
        GenerateBillsRequest: {
          type: 'object',
          required: ['month', 'year'],
          properties: {
            month: { type: 'integer', minimum: 1, maximum: 12, example: 5 },
            year: { type: 'integer', example: 2026 },
            dueDayOfMonth: { type: 'integer', minimum: 1, maximum: 28, example: 10 },
          },
        },
        RecordPaymentRequest: {
          type: 'object',
          required: ['paidAmount'],
          properties: {
            paidAmount: { type: 'number', example: 1550 },
            paymentMode: { type: 'string', example: 'UPI' },
            remarks: { type: 'string' },
          },
        },
        // ── Settings ────────────────────────────────────────────────────────
        Settings: {
          type: 'object',
          properties: {
            societyName: { type: 'string' },
            address: { type: 'string' },
            ratePerSqft: { type: 'number' },
            fixedCharge: { type: 'number' },
            lateFeeGraceDays: { type: 'integer' },
            lateFeePerDay: { type: 'number' },
          },
        },
        UpdateSettingsRequest: {
          type: 'object',
          properties: {
            societyName: { type: 'string' },
            address: { type: 'string' },
            ratePerSqft: { type: 'number', example: 1.5 },
            fixedCharge: { type: 'number', example: 700 },
            lateFeeGraceDays: { type: 'integer', example: 5 },
            lateFeePerDay: { type: 'number', example: 10 },
          },
        },
        // ── Visitor ─────────────────────────────────────────────────────────
        Visitor: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string', nullable: true },
            purpose: { type: 'string' },
            flatId: { type: 'string' },
            vehicleNumber: { type: 'string', nullable: true },
            entryTime: { type: 'string', format: 'date-time' },
            exitTime: { type: 'string', format: 'date-time', nullable: true },
            societyId: { type: 'integer' },
          },
        },
        LogVisitorEntryRequest: {
          type: 'object',
          required: ['name', 'purpose', 'flatId'],
          properties: {
            name: { type: 'string', example: 'Delivery Person' },
            phone: { type: 'string', example: '9876500000' },
            purpose: { type: 'string', example: 'Package delivery' },
            flatId: { type: 'string', example: 'F2-03' },
            vehicleNumber: { type: 'string', example: 'MH12XY9999' },
          },
        },
        LogVisitorExitRequest: {
          type: 'object',
          properties: {
            exitTime: { type: 'string', format: 'date-time' },
          },
        },
        // ── Asset ───────────────────────────────────────────────────────────
        Asset: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            location: { type: 'string', nullable: true },
            status: { type: 'string' },
            purchaseDate: { type: 'string', format: 'date', nullable: true },
            lastServiceDate: { type: 'string', format: 'date', nullable: true },
            societyId: { type: 'integer' },
          },
        },
        CreateAssetRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Generator' },
            description: { type: 'string' },
            location: { type: 'string', example: 'Basement' },
            status: { type: 'string', example: 'active' },
            purchaseDate: { type: 'string', format: 'date' },
            lastServiceDate: { type: 'string', format: 'date' },
          },
        },
        UpdateAssetRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            status: { type: 'string' },
            purchaseDate: { type: 'string', format: 'date' },
            lastServiceDate: { type: 'string', format: 'date' },
          },
        },
        // ── Parking ─────────────────────────────────────────────────────────
        ParkingSlot: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            slotNumber: { type: 'string' },
            isOccupied: { type: 'boolean' },
            residentId: { type: 'string', nullable: true },
            flatId: { type: 'string', nullable: true },
            vehicleNumber: { type: 'string', nullable: true },
            societyId: { type: 'integer' },
          },
        },
        CreateParkingSlotRequest: {
          type: 'object',
          required: ['slotNumber'],
          properties: {
            slotNumber: { type: 'string', example: 'P-01' },
            residentId: { type: 'string' },
            flatId: { type: 'string' },
            vehicleNumber: { type: 'string' },
          },
        },
        UpdateParkingSlotRequest: {
          type: 'object',
          properties: {
            slotNumber: { type: 'string' },
            isOccupied: { type: 'boolean' },
            residentId: { type: 'string', nullable: true },
            flatId: { type: 'string', nullable: true },
            vehicleNumber: { type: 'string', nullable: true },
          },
        },
        // ── Notice ──────────────────────────────────────────────────────────
        Notice: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            societyId: { type: 'integer' },
          },
        },
        CreateNoticeRequest: {
          type: 'object',
          required: ['title', 'body'],
          properties: {
            title: { type: 'string', example: 'Water supply maintenance' },
            body: { type: 'string', example: 'Water will be off on Sunday 8AM-12PM.' },
            isActive: { type: 'boolean', example: true },
          },
        },
        UpdateNoticeRequest: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            body: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        // ── Complaint ───────────────────────────────────────────────────────
        Complaint: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            residentId: { type: 'string' },
            flatId: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'] },
            adminRemark: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            societyId: { type: 'integer' },
          },
        },
        CreateComplaintRequest: {
          type: 'object',
          required: ['category', 'description'],
          properties: {
            category: { type: 'string', example: 'Plumbing' },
            description: { type: 'string', example: 'Water leakage in bathroom.' },
          },
        },
        UpdateComplaintRequest: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'] },
            adminRemark: { type: 'string' },
          },
        },
        // ── Staff ───────────────────────────────────────────────────────────
        Staff: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            phone: { type: 'string', nullable: true },
            email: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            societyId: { type: 'integer' },
          },
        },
        CreateStaffRequest: {
          type: 'object',
          required: ['name', 'role'],
          properties: {
            name: { type: 'string', example: 'Ramu Guard' },
            role: { type: 'string', example: 'security' },
            phone: { type: 'string', example: '9988776655' },
            email: { type: 'string', example: 'ramu@example.com' },
          },
        },
        UpdateStaffRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        // ── Notification ────────────────────────────────────────────────────
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            residentId: { type: 'string' },
            message: { type: 'string' },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Directory ───────────────────────────────────────────────────────
        DirectoryEntry: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            flatNumber: { type: 'string' },
            floor: { type: 'integer' },
            flatType: { type: 'string' },
          },
        },
        // ── Shared ──────────────────────────────────────────────────────────
        PaginatedMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            skip: { type: 'integer' },
            limit: { type: 'integer' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);