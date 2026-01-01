import { MapPin, Calendar, Users, MessageSquare, BarChart3, Shield, Bell, Sparkles } from "lucide-react";

const FeaturesSection = () => {
  const playerFeatures = [
    {
      icon: MapPin,
      title: "Discover Stadiums",
      description: "Find nearby pitches on an interactive map with real-time availability",
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Book available time slots with just a few clicks",
    },
    {
      icon: Users,
      title: "Build Your Team",
      description: "Create or join teams and find players at your level",
    },
    {
      icon: MessageSquare,
      title: "Team Chat",
      description: "Coordinate with teammates through integrated messaging",
    },
  ];

  const ownerFeatures = [
    {
      icon: Shield,
      title: "Stadium Registration",
      description: "Register your stadium digitally with full control",
    },
    {
      icon: Calendar,
      title: "Smart Timeline",
      description: "Manage availability with drag-and-drop scheduling",
    },
    {
      icon: Bell,
      title: "Booking Requests",
      description: "Receive and manage requests in real-time",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track bookings, revenue, and peak hours",
    },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Powerful Features</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you're a player looking for a match or a stadium owner managing bookings, 
            we've got you covered.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Player Features */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground">For Players</h3>
            </div>
            <div className="grid gap-4">
              {playerFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="card-stadium p-6 flex items-start gap-4 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-primary/20 group-hover:scale-110">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Features */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground">For Stadium Owners</h3>
            </div>
            <div className="grid gap-4">
              {ownerFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="card-stadium p-6 flex items-start gap-4 group"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-primary/20 group-hover:scale-110">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
