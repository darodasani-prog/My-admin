import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = "logistics-admin-secret-key";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // Mock Data
  const drivers = [
    { id: "1", name: "John Doe", phone: "+1 234 567 8901", vehicle: "Toyota Camry (ABC-123)", status: "online", rating: 4.8, earnings: 1250.50, verified: true, license: "L-123456", vehiclePhoto: "https://picsum.photos/seed/car1/400/300" },
    { id: "2", name: "Jane Smith", phone: "+1 234 567 8902", vehicle: "Honda Civic (XYZ-789)", status: "busy", rating: 4.9, earnings: 2100.00, verified: true, license: "L-789012", vehiclePhoto: "https://picsum.photos/seed/car2/400/300" },
    { id: "3", name: "Mike Johnson", phone: "+1 234 567 8903", vehicle: "Ford F-150 (TRK-456)", status: "offline", rating: 4.5, earnings: 850.25, verified: false, license: "L-345678", vehiclePhoto: "https://picsum.photos/seed/car3/400/300" },
    { id: "4", name: "Sarah Williams", phone: "+1 234 567 8904", vehicle: "Tesla Model 3 (EV-001)", status: "online", rating: 5.0, earnings: 3200.75, verified: true, license: "L-901234", vehiclePhoto: "https://picsum.photos/seed/car4/400/300" },
  ];

  const customers = [
    { id: "c1", name: "Alice Brown", email: "alice@example.com", phone: "+1 555 0101", trips: 12, flagged: false },
    { id: "c2", name: "Bob Miller", email: "bob@example.com", phone: "+1 555 0102", trips: 5, flagged: true },
    { id: "c3", name: "Charlie Davis", email: "charlie@example.com", phone: "+1 555 0103", trips: 28, flagged: false },
  ];

  const trips = [
    { 
      id: "t1", 
      customer: "Alice Brown", 
      driver: "John Doe", 
      pickup: "123 Main St", 
      dropoff: "456 Oak Ave", 
      status: "completed", 
      price: 25.50, 
      date: "2026-04-06T10:00:00Z",
      otpTimestamp: "2026-04-06T10:05:00Z",
      paymentStatus: "paid",
      paymentMethod: "transfer",
      routeHistory: [
        { lat: 40.7128, lng: -74.0060, time: "10:00:00" },
        { lat: 40.7138, lng: -74.0070, time: "10:02:00" },
        { lat: 40.7148, lng: -74.0080, time: "10:05:00" }
      ],
      chatLog: [
        { sender: "driver", message: "I'm outside", time: "10:01:00" },
        { sender: "customer", message: "Coming now", time: "10:02:00" }
      ]
    },
    { 
      id: "t2", 
      customer: "Bob Miller", 
      driver: "Jane Smith", 
      pickup: "789 Pine Rd", 
      dropoff: "321 Elm St", 
      status: "active", 
      price: 42.00, 
      date: "2026-04-06T12:15:00Z",
      otpTimestamp: null,
      paymentStatus: "pending",
      paymentMethod: "cash",
      routeHistory: [
        { lat: 40.7228, lng: -74.0160, time: "12:15:00" },
        { lat: 40.7238, lng: -74.0170, time: "12:18:00" }
      ],
      chatLog: []
    },
    { 
      id: "t3", 
      customer: "Charlie Davis", 
      driver: "Sarah Williams", 
      pickup: "555 Broadway", 
      dropoff: "888 5th Ave", 
      status: "disputed", 
      price: 15.75, 
      date: "2026-04-05T15:30:00Z",
      otpTimestamp: "2026-04-05T15:45:00Z",
      paymentStatus: "paid",
      paymentMethod: "transfer",
      routeHistory: [
        { lat: 40.7328, lng: -74.0260, time: "15:30:00" },
        { lat: 40.7338, lng: -74.0270, time: "15:45:00" }
      ],
      chatLog: [
        { sender: "customer", message: "Where are you?", time: "15:40:00" }
      ],
      dispute: {
        reason: "Wrong dropoff location",
        reportedBy: "customer",
        customerComment: "Driver dropped me 2 blocks away.",
        driverComment: "Road was closed, customer agreed to walk.",
        customerRating: 2,
        driverRating: 5,
        plannedRoute: [
          { lat: 40.7328, lng: -74.0260 },
          { lat: 40.7358, lng: -74.0290 }
        ]
      }
    }
  ];

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    // For demo: admin@logistics.com / admin123
    if (email === "admin@logistics.com" && password === "admin123") {
      const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET);
      res.json({ token, user: { email, role: 'admin' } });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.get("/api/dashboard/stats", authenticateToken, (req, res) => {
    res.json({
      activeTrips: trips.filter(t => t.status === 'active').length,
      onlineDrivers: drivers.filter(d => d.status === 'online').length,
      todayRevenue: trips.reduce((sum, t) => sum + t.price, 0),
      pendingVerifications: drivers.filter(d => !d.verified).length
    });
  });

  app.get("/api/dashboard/activity", authenticateToken, (req, res) => {
    res.json([
      { id: 1, action: "Driver John Doe started trip t1", time: "2 mins ago" },
      { id: 2, action: "New driver Mike Johnson registered", time: "15 mins ago" },
      { id: 3, action: "Trip t3 marked as disputed", time: "1 hour ago" },
      { id: 4, action: "Customer Charlie Davis paid $15.75", time: "2 hours ago" },
    ]);
  });

  app.get("/api/drivers", authenticateToken, (req, res) => res.json(drivers));
  app.post("/api/drivers/:id/verify", authenticateToken, (req, res) => {
    const driver = drivers.find(d => d.id === req.params.id);
    if (driver) {
      driver.verified = true;
      res.json(driver);
    } else {
      res.status(404).json({ message: "Driver not found" });
    }
  });

  app.post("/api/drivers/:id/suspend", authenticateToken, (req, res) => {
    const driver = drivers.find(d => d.id === req.params.id);
    if (driver) {
      driver.status = 'offline';
      res.json(driver);
    } else {
      res.status(404).json({ message: "Driver not found" });
    }
  });

  app.get("/api/trips", authenticateToken, (req, res) => res.json(trips));
  app.get("/api/customers", authenticateToken, (req, res) => res.json(customers));
  
  app.get("/api/financials", authenticateToken, (req, res) => {
    const totalRevenue = trips.reduce((sum, t) => sum + t.price, 0);
    const commission = totalRevenue * 0.15;
    res.json({
      totalRevenue,
      commission,
      pendingPayouts: totalRevenue - commission,
      breakdown: {
        cash: trips.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.price, 0),
        transfer: trips.filter(t => t.paymentMethod === 'transfer').reduce((sum, t) => sum + t.price, 0)
      }
    });
  });

  app.get("/api/disputes", authenticateToken, (req, res) => {
    res.json(trips.filter(t => t.status === 'disputed'));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
