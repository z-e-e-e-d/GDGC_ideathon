// src/pages/admin/AdminDashboard.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Building, 
  Calendar, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  AlertTriangle, 
  UserCheck, 
  FileText, 
  Settings,
  CreditCard,
  MessageSquare,
  Star
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";

// Mock data
const recentUsers = [
  { id: "1", name: "Ahmed Ben", email: "ahmed@example.com", role: "Player", status: "Active", joinDate: "Today" },
  { id: "2", name: "Fatima Z.", email: "fatima@example.com", role: "Owner", status: "Pending", joinDate: "Yesterday" },
  { id: "3", name: "Karim M.", email: "karim@example.com", role: "Captain", status: "Active", joinDate: "2 days ago" },
  { id: "4", name: "Yasmine K.", email: "yasmine@example.com", role: "Player", status: "Suspended", joinDate: "3 days ago" },
];

const recentBookings = [
  { id: "1", user: "Ali R.", stadium: "El Harrach Stadium", time: "18:00-20:00", status: "Confirmed", amount: "₦10,000" },
  { id: "2", user: "Team FC Eagles", stadium: "Bab Ezzouar Pitch", time: "20:00-22:00", status: "Pending", amount: "₦8,000" },
  { id: "3", user: "Mohammed S.", stadium: "Hussein Dey Arena", time: "16:00-18:00", status: "Completed", amount: "₦12,000" },
];

const systemAlerts = [
  { id: "1", type: "error", message: "Payment gateway experiencing issues", time: "2 hours ago" },
  { id: "2", type: "warning", message: "3 stadiums need verification", time: "5 hours ago" },
  { id: "3", type: "info", message: "System backup completed", time: "1 day ago" },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("week");

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  // Stats data
  const stats = [
    { 
      icon: Users, 
      label: "Total Users", 
      value: "2,847", 
      change: "+12%", 
      changeType: "increase",
      color: "blue",
      detail: "Active users"
    },
    { 
      icon: Building, 
      label: "Stadiums", 
      value: "156", 
      change: "+8%", 
      changeType: "increase",
      color: "green",
      detail: "Verified: 142"
    },
    { 
      icon: Calendar, 
      label: "Bookings", 
      value: "324", 
      change: "+23%", 
      changeType: "increase",
      color: "amber",
      detail: "This week"
    },
    { 
      icon: DollarSign, 
      label: "Revenue", 
      value: "₦2.4M", 
      change: "+18%", 
      changeType: "increase",
      color: "purple",
      detail: "Monthly total"
    },
  ];

  const quickActions = [
    { icon: UserCheck, label: "Verify Users", path: "/admin/users", description: "Approve pending registrations" },
    { icon: Building, label: "Manage Stadiums", path: "/admin/stadiums", description: "View and edit stadiums" },
    { icon: CreditCard, label: "Process Payments", path: "/admin/payments", description: "Handle payment issues" },
    { icon: AlertTriangle, label: "View Reports", path: "/admin/reports", description: "User reports & issues" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl md:text-3xl text-foreground">
              {greeting}, Admin {user?.name?.split(" ")[0]}! 👋
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your platform today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {["day", "week", "month", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <Link to="/admin/settings">
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card-stadium p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
              <div className={`px-2 py-1 rounded text-sm font-medium ${
                stat.changeType === 'increase' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {stat.change} <TrendingUp className="w-3 h-3 inline ml-1" />
              </div>
            </div>
            <p className="font-display text-2xl text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Charts & Quick Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card-stadium p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl text-foreground">Revenue Overview</h2>
              <p className="text-sm text-muted-foreground">Last 30 days performance</p>
            </div>
            <Link to="/admin/reports" className="text-primary text-sm hover:underline flex items-center gap-1">
              View details <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Simplified Chart */}
          <div className="h-64 flex items-end gap-2 border-b border-border pb-6">
            {[40, 60, 75, 50, 85, 65, 90].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t-lg ${index === 6 ? 'bg-primary' : 'bg-primary/50'}`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-muted-foreground mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">₦2.4M</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">+18%</p>
              <p className="text-sm text-muted-foreground">Growth Rate</p>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="card-stadium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-display text-xl text-foreground">System Alerts</h2>
            </div>
            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
              3 Active
            </span>
          </div>
          
          <div className="space-y-3">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 mt-1.5 rounded-full ${
                    alert.type === 'error' ? 'bg-red-500' : 
                    alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Link to="/admin/alerts">
            <Button variant="link" className="w-full mt-4 text-primary">
              View all alerts
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      <div className="card-stadium p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl text-foreground">Recent Users</h2>
            <p className="text-sm text-muted-foreground">Latest user registrations</p>
          </div>
          <Link to="/admin/users" className="text-primary text-sm hover:underline flex items-center gap-1">
            Manage all users <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Join Date</th>
                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-secondary text-foreground rounded text-xs">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' :
                      user.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {user.joinDate}
                  </td>
                  <td className="py-4">
                    <Button size="sm" variant="ghost">
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card-stadium p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl text-foreground">Recent Bookings</h2>
            <p className="text-sm text-muted-foreground">Latest stadium bookings</p>
          </div>
          <Link to="/admin/bookings" className="text-primary text-sm hover:underline flex items-center gap-1">
            View all bookings <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{booking.user}</p>
                  <p className="text-sm text-muted-foreground">{booking.stadium}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-foreground">{booking.amount}</p>
                <p className="text-sm text-muted-foreground">{booking.time}</p>
              </div>
              
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link 
            key={index} 
            to={action.path}
            className="card-stadium p-6 group cursor-pointer hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <action.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg text-foreground">{action.label}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-primary">Quick Action</span>
              <ChevronRight className="w-4 h-4 text-primary transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Platform Health */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-stadium p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-display text-lg text-foreground">Platform Rating</h3>
              <p className="text-sm text-muted-foreground">User satisfaction</p>
            </div>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl text-foreground mb-2">4.8</p>
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Based on 847 reviews</p>
          </div>
        </div>

        <div className="card-stadium p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-display text-lg text-foreground">Support Tickets</h3>
              <p className="text-sm text-muted-foreground">Pending requests</p>
            </div>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl text-foreground mb-2">12</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">High Priority</span>
                <span className="font-medium text-foreground">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Medium</span>
                <span className="font-medium text-foreground">5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Low</span>
                <span className="font-medium text-foreground">4</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-stadium p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-green-500" />
            <div>
              <h3 className="font-display text-lg text-foreground">System Uptime</h3>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </div>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl text-foreground mb-2">99.9%</p>
            <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-2">
              <div className="absolute left-0 top-0 h-full bg-green-500" style={{ width: '99.9%' }} />
            </div>
            <p className="text-sm text-muted-foreground">No downtime reported</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;