import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Truck, 
  Users, 
  UserCircle, 
  DollarSign, 
  AlertTriangle, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  ShieldCheck,
  Ban,
  MessageSquare,
  Navigation
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import api from './services/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Protected Route ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// --- Layout Component ---
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = Navigate;

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Live Map', path: '/map', icon: MapIcon },
    { name: 'Trips Management', path: '/trips', icon: Truck },
    { name: 'Drivers Management', path: '/drivers', icon: UserCircle },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Financials', path: '/financials', icon: DollarSign },
    { name: 'Dispute Resolution', path: '/disputes', icon: AlertTriangle },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 text-white transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">LogiAdmin</span>}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                location.pathname === item.path 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-semibold">Admin User</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-lg", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-sm text-gray-500 font-medium">{title}</p>
    <h3 className="text-2xl font-bold mt-1">{value}</h3>
  </div>
);

// --- Pages ---

const Login = () => {
  const [email, setEmail] = useState('admin@logistics.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/';
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">LogiAdmin</h1>
          <p className="text-gray-500 mt-2">Logistics Platform Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@logistics.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activity')
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data);
    };
    fetchData();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-100">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Trips" value={stats.activeTrips} icon={Navigation} trend={12} color="bg-blue-600" />
        <StatCard title="Online Drivers" value={stats.onlineDrivers} icon={Users} trend={5} color="bg-green-600" />
        <StatCard title="Today's Revenue" value={`$${stats.todayRevenue.toFixed(2)}`} icon={DollarSign} trend={8} color="bg-purple-600" />
        <StatCard title="Pending Verifications" value={stats.pendingVerifications} icon={ShieldCheck} trend={-2} color="bg-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Revenue Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'Mon', rev: 4000 },
                { name: 'Tue', rev: 3000 },
                { name: 'Wed', rev: 2000 },
                { name: 'Thu', rev: 2780 },
                { name: 'Fri', rev: 1890 },
                { name: 'Sat', rev: 2390 },
                { name: 'Sun', rev: 3490 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="rev" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {activity.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <div>
                  <p className="text-sm text-gray-800">{item.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            View All Activity
          </button>
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 p-6 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h4 className="font-bold text-red-900">Urgent: 3 Disputed Trips</h4>
            <p className="text-sm text-red-700">There are unresolved disputes that require immediate attention.</p>
          </div>
        </div>
        <Link to="/disputes" className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
          Resolve Now
        </Link>
      </div>
    </div>
  );
};

const LiveMap = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const fetchMapData = async () => {
    const [driversRes, tripsRes] = await Promise.all([
      api.get('/drivers'),
      api.get('/trips')
    ]);
    setDrivers(driversRes.data);
    setTrips(tripsRes.data);
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (status: string) => {
    const color = status === 'online' ? '#10b981' : status === 'busy' ? '#2563eb' : '#ef4444';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  return (
    <div className="h-full -m-8 relative">
      <MapContainer center={[40.7128, -74.0060]} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {drivers.map(driver => (
          <Marker 
            key={driver.id} 
            position={[40.7128 + (Math.random() - 0.5) * 0.05, -74.0060 + (Math.random() - 0.5) * 0.05]} 
            icon={getIcon(driver.status)}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-bold">{driver.name}</h4>
                <p className="text-xs text-gray-500">{driver.vehicle}</p>
                <p className="text-xs font-medium mt-1">Status: <span className="capitalize">{driver.status}</span></p>
                <p className="text-xs mt-1">{driver.phone}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {trips.filter(t => t.status === 'active').map(trip => (
          <Marker 
            key={`dest-${trip.id}`} 
            position={[40.7148, -74.0080]} 
            icon={getIcon('destination')}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-bold text-red-600">Destination: {trip.id}</h4>
                <p className="text-xs">{trip.dropoff}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-xl shadow-xl border border-gray-200">
        <h4 className="font-bold text-sm mb-3">Map Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500" /> Available Drivers
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-600" /> Busy (On Trip)
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500" /> Trip Destinations
          </div>
        </div>
      </div>
    </div>
  );
};

const TripsManagement = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  useEffect(() => {
    api.get('/trips').then(res => setTrips(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trips Management</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search trips..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-64" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pickup</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Dropoff</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trips.map(trip => (
                <tr key={trip.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTrip(trip)}>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">#{trip.id}</td>
                  <td className="px-6 py-4 text-sm">{trip.customer}</td>
                  <td className="px-6 py-4 text-sm">{trip.driver}</td>
                  <td className="px-6 py-4 text-sm truncate max-w-[150px]">{trip.pickup}</td>
                  <td className="px-6 py-4 text-sm truncate max-w-[150px]">{trip.dropoff}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                      trip.status === 'completed' ? "bg-green-100 text-green-700" :
                      trip.status === 'active' ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">${trip.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(trip.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Trip Details: #{selectedTrip.id}</h2>
              <button onClick={() => setSelectedTrip(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase font-bold">Customer</p>
                    <p className="font-bold mt-1">{selectedTrip.customer}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase font-bold">Driver</p>
                    <p className="font-bold mt-1">{selectedTrip.driver}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600" />
                      <div className="w-0.5 h-12 bg-gray-200" />
                      <div className="w-3 h-3 rounded-full bg-red-600" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Pickup</p>
                        <p className="text-sm font-medium">{selectedTrip.pickup}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Dropoff</p>
                        <p className="text-sm font-medium">{selectedTrip.dropoff}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 uppercase font-bold">OTP Verification</p>
                    <p className="text-sm font-bold mt-1">{selectedTrip.otpTimestamp ? new Date(selectedTrip.otpTimestamp).toLocaleTimeString() : 'Pending'}</p>
                  </div>
                  <CheckCircle className={cn("w-6 h-6", selectedTrip.otpTimestamp ? "text-green-600" : "text-gray-300")} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="h-64 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <MapContainer center={[40.7128, -74.0060]} zoom={14} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Polyline positions={selectedTrip.routeHistory.map((p: any) => [p.lat, p.lng])} color="blue" />
                  </MapContainer>
                </div>
                <div>
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Chat Log
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {selectedTrip.chatLog.length > 0 ? selectedTrip.chatLog.map((chat: any, i: number) => (
                      <div key={i} className={cn("p-3 rounded-xl text-sm", chat.sender === 'driver' ? "bg-blue-50 ml-8" : "bg-gray-100 mr-8")}>
                        <p className="font-bold text-[10px] uppercase text-gray-500 mb-1">{chat.sender}</p>
                        <p>{chat.message}</p>
                        <p className="text-[10px] text-right text-gray-400 mt-1">{chat.time}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-400 text-center py-4">No communication log available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DriversManagement = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  useEffect(() => {
    api.get('/drivers').then(res => setDrivers(res.data));
  }, []);

  const handleVerify = async (id: string) => {
    try {
      await api.post(`/drivers/${id}/verify`);
      const res = await api.get('/drivers');
      setDrivers(res.data);
      setSelectedDriver(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await api.post(`/drivers/${id}/suspend`);
      const res = await api.get('/drivers');
      setDrivers(res.data);
      setSelectedDriver(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Drivers Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
          Add New Driver
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Earnings</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Verified</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs">
                        {driver.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium">{driver.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{driver.phone}</td>
                  <td className="px-6 py-4 text-sm">{driver.vehicle}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", driver.status === 'online' ? "bg-green-500" : driver.status === 'busy' ? "bg-blue-500" : "bg-gray-400")} />
                      <span className="text-sm capitalize">{driver.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">⭐ {driver.rating}</td>
                  <td className="px-6 py-4 text-sm font-bold">${driver.earnings.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {driver.verified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-500" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedDriver(driver)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Driver Profile: {selectedDriver.name}</h2>
              <button onClick={() => setSelectedDriver(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex gap-8">
                <img src={selectedDriver.vehiclePhoto} className="w-48 h-32 object-cover rounded-xl border border-gray-200" alt="Vehicle" referrerPolicy="no-referrer" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">License Number</p>
                  <p className="text-lg font-bold">{selectedDriver.license}</p>
                  <p className="text-sm text-gray-500 mt-4">Vehicle Details</p>
                  <p className="text-lg font-bold">{selectedDriver.vehicle}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-xs text-gray-500 uppercase font-bold">Total Trips</p>
                  <p className="text-xl font-bold mt-1">142</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-xs text-gray-500 uppercase font-bold">Rating</p>
                  <p className="text-xl font-bold mt-1">⭐ {selectedDriver.rating}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-xs text-gray-500 uppercase font-bold">Lifetime Earnings</p>
                  <p className="text-xl font-bold mt-1">${selectedDriver.earnings.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-4">
                {!selectedDriver.verified && (
                  <button 
                    onClick={() => handleVerify(selectedDriver.id)}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
                  >
                    Verify Documents
                  </button>
                )}
                <button 
                  onClick={() => handleSuspend(selectedDriver.id)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  Suspend Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/customers').then(res => setCustomers(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total Trips</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{customer.name}</td>
                <td className="px-6 py-4 text-sm">{customer.email}</td>
                <td className="px-6 py-4 text-sm">{customer.phone}</td>
                <td className="px-6 py-4 text-sm font-bold">{customer.trips}</td>
                <td className="px-6 py-4">
                  {customer.flagged ? (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Flagged</span>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Active</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 text-sm font-bold hover:underline">View History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Financials = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/financials').then(res => setData(res.data));
  }, []);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Revenue,${data.totalRevenue}\n`
      + `Commission,${data.commission}\n`
      + `Pending Payouts,${data.pendingPayouts}\n`
      + `Cash Payments,${data.breakdown.cash}\n`
      + `Transfer Payments,${data.breakdown.transfer}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Financials</h1>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
        >
          <Download className="w-4 h-4" /> Export to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Platform Commission (15%)</p>
          <h3 className="text-3xl font-bold mt-2 text-blue-600">${data.commission.toFixed(2)}</h3>
          <p className="text-xs text-gray-400 mt-2">From ${data.totalRevenue.toFixed(2)} total revenue</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Driver Payouts Pending</p>
          <h3 className="text-3xl font-bold mt-2 text-orange-600">${data.pendingPayouts.toFixed(2)}</h3>
          <p className="text-xs text-gray-400 mt-2">To be processed this week</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
          <h3 className="text-3xl font-bold mt-2 text-green-600">${data.totalRevenue.toFixed(2)}</h3>
          <p className="text-xs text-gray-400 mt-2">Gross transaction volume</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-8">Payment Method Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Cash', value: data.breakdown.cash },
                    { name: 'Transfer', value: data.breakdown.transfer },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#2563eb" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-sm font-medium">Cash: ${data.breakdown.cash.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Transfer: ${data.breakdown.transfer.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Revenue by Day</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Mon', rev: 400 },
                { name: 'Tue', rev: 300 },
                { name: 'Wed', rev: 200 },
                { name: 'Thu', rev: 278 },
                { name: 'Fri', rev: 189 },
                { name: 'Sat', rev: 239 },
                { name: 'Sun', rev: 349 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="rev" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const DisputeResolution = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);

  useEffect(() => {
    api.get('/disputes').then(res => setDisputes(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dispute Resolution</h1>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Trip ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Reported By</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {disputes.map(dispute => (
              <tr key={dispute.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-bold text-blue-600">#{dispute.id}</td>
                <td className="px-6 py-4 text-sm">{dispute.dispute.reason}</td>
                <td className="px-6 py-4 text-sm capitalize">{dispute.dispute.reportedBy}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(dispute.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => setSelectedDispute(dispute)}
                    className="bg-red-600 text-white px-4 py-1 rounded-lg text-xs font-bold hover:bg-red-700"
                  >
                    Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Investigation: Trip #{selectedDispute.id}</h2>
              <button onClick={() => setSelectedDispute(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-900 mb-4">Dispute Details</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-red-700 uppercase font-bold">Customer Comment</p>
                        <p className="text-sm mt-1">"{selectedDispute.dispute.customerComment}"</p>
                        <p className="text-xs text-gray-500 mt-1">Rating given: ⭐ {selectedDispute.dispute.customerRating}</p>
                      </div>
                      <div>
                        <p className="text-xs text-red-700 uppercase font-bold">Driver Comment</p>
                        <p className="text-sm mt-1">"{selectedDispute.dispute.driverComment}"</p>
                        <p className="text-xs text-gray-500 mt-1">Rating given: ⭐ {selectedDispute.dispute.driverRating}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="font-bold mb-4">Verification Data</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">OTP Verified At:</span>
                        <span className="font-bold">{new Date(selectedDispute.otpTimestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Actual Arrival:</span>
                        <span className="font-bold">15:45:12</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Planned Route Distance:</span>
                        <span className="font-bold">2.4 km</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Actual Route Distance:</span>
                        <span className="font-bold text-red-600">3.1 km (+29%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="h-80 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <MapContainer center={[40.7328, -74.0260]} zoom={14} className="h-full w-full">
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {/* Actual Route */}
                      <Polyline positions={selectedDispute.routeHistory.map((p: any) => [p.lat, p.lng])} color="blue" weight={4} />
                      {/* Planned Route */}
                      <Polyline positions={selectedDispute.dispute.plannedRoute.map((p: any) => [p.lat, p.lng])} color="red" dashArray="10, 10" weight={2} />
                    </MapContainer>
                  </div>
                  <div className="flex justify-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-blue-600" /> Actual Route
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-red-600 border-t border-dashed" /> Planned Route
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                  Refund Customer
                </button>
                <button className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
                  Compensate Driver
                </button>
                <button className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
                  Ban User
                </button>
                <button className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors">
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><Layout><LiveMap /></Layout></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><Layout><TripsManagement /></Layout></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><Layout><DriversManagement /></Layout></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
        <Route path="/financials" element={<ProtectedRoute><Layout><Financials /></Layout></ProtectedRoute>} />
        <Route path="/disputes" element={<ProtectedRoute><Layout><DisputeResolution /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
