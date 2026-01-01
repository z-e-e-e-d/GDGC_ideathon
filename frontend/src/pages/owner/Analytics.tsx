import { BarChart3, TrendingUp, Calendar, DollarSign, Clock, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const Analytics = () => {
  const weeklyData = [
    { day: "Mon", bookings: 6, revenue: 30000 },
    { day: "Tue", bookings: 4, revenue: 20000 },
    { day: "Wed", bookings: 8, revenue: 40000 },
    { day: "Thu", bookings: 5, revenue: 25000 },
    { day: "Fri", bookings: 10, revenue: 50000 },
    { day: "Sat", bookings: 12, revenue: 60000 },
    { day: "Sun", bookings: 9, revenue: 45000 },
  ];

  const peakHours = [
    { hour: "16:00", percentage: 85 },
    { hour: "17:00", percentage: 92 },
    { hour: "18:00", percentage: 98 },
    { hour: "19:00", percentage: 95 },
    { hour: "20:00", percentage: 88 },
    { hour: "21:00", percentage: 75 },
  ];

  const maxBookings = Math.max(...weeklyData.map(d => d.bookings));
  const totalRevenue = weeklyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalBookings = weeklyData.reduce((sum, d) => sum + d.bookings, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your stadium performance
          </p>
        </div>
        <Select defaultValue="week">
          <SelectTrigger className="w-full md:w-40 bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Total Revenue", value: `${(totalRevenue / 1000).toFixed(0)}K`, suffix: "DZD", trend: "+12% vs last week" },
          { icon: Calendar, label: "Total Bookings", value: totalBookings.toString(), trend: "+8 vs last week" },
          { icon: TrendingUp, label: "Avg. Occupancy", value: "78%", trend: "+5% improvement" },
          { icon: Users, label: "Unique Teams", value: "24", trend: "6 new this week" },
        ].map((stat, i) => (
          <div key={i} className="card-stadium p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="font-display text-2xl text-foreground">
              {stat.value}
              {stat.suffix && <span className="text-sm text-muted-foreground ml-1">{stat.suffix}</span>}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-primary mt-1">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Bookings Chart */}
        <div className="card-stadium p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg text-foreground">Weekly Bookings</h2>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/30 relative group"
                  style={{ height: `${(day.bookings / maxBookings) * 100}%` }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all"
                    style={{ height: `${(day.bookings / maxBookings) * 100}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.bookings} bookings
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card-stadium p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg text-foreground">Weekly Revenue</h2>
            <DollarSign className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-8 text-sm text-muted-foreground">{day.day}</span>
                <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                    style={{ width: `${(day.revenue / 60000) * 100}%` }}
                  />
                </div>
                <span className="w-20 text-sm text-foreground text-right">
                  {(day.revenue / 1000).toFixed(0)}K DZD
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="card-stadium p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg text-foreground">Peak Hours</h2>
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {peakHours.map((hour, i) => (
            <div key={i} className="text-center">
              <div className="relative h-24 bg-secondary rounded-lg overflow-hidden mb-2">
                <div
                  className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all ${
                    hour.percentage >= 90 ? "bg-primary" :
                    hour.percentage >= 80 ? "bg-primary/80" :
                    "bg-primary/60"
                  }`}
                  style={{ height: `${hour.percentage}%` }}
                />
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground">
                  {hour.percentage}%
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{hour.hour}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          💡 Pro tip: Consider offering discounts during off-peak hours to maximize bookings
        </p>
      </div>

      {/* Empty Slots Analysis */}
      <div className="card-stadium p-6">
        <h2 className="font-display text-lg text-foreground mb-4">Empty Slots Analysis</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-secondary/50 rounded-xl">
            <p className="font-display text-3xl text-foreground">32</p>
            <p className="text-sm text-muted-foreground">Empty slots this week</p>
          </div>
          <div className="text-center p-4 bg-destructive/10 rounded-xl border border-destructive/20">
            <p className="font-display text-3xl text-destructive">160K</p>
            <p className="text-sm text-muted-foreground">Potential lost revenue (DZD)</p>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/20">
            <p className="font-display text-3xl text-primary">22%</p>
            <p className="text-sm text-muted-foreground">Empty slot rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
