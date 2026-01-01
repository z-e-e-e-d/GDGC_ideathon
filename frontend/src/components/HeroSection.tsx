import { Link } from "react-router-dom";
import { MapPin, Users, Calendar, Zap } from "lucide-react";
import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 pitch-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-glow delay-1000" />
      
      {/* Pitch Lines */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-[600px] h-[400px] border-2 border-primary rounded-lg">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-primary" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Algeria's #1 Stadium Booking Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 animate-slide-up">
            Book Your Perfect
            <span className="block text-primary text-glow mt-2">Football Pitch</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
            Connect with nearby stadiums, build your dream team, and organize matches 
            effortlessly. The future of amateur football is here.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-200">
            <Link to="/register?role=player">
              <Button size="lg" className="btn-primary text-lg px-8 py-6 gap-2">
                <Users className="w-5 h-5" />
                Join as Player
              </Button>
            </Link>
            <Link to="/register?role=owner">
              <Button size="lg" variant="outline" className="btn-outline-glow text-lg px-8 py-6 gap-2">
                <MapPin className="w-5 h-5" />
                Register Stadium
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up delay-300">
            {[
              { icon: MapPin, value: "150+", label: "Stadiums" },
              { icon: Users, value: "5K+", label: "Players" },
              { icon: Calendar, value: "10K+", label: "Matches" },
              { icon: Zap, value: "98%", label: "Satisfaction" },
            ].map((stat, index) => (
              <div key={index} className="card-stadium p-6 text-center group">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3 transition-transform group-hover:scale-110" />
                <div className="font-display text-2xl md:text-3xl text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
